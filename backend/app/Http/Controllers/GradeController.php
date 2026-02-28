<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Course;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GradeController extends Controller
{
    /**
     * Display a listing of graded enrollments.
     */
    public function index(Request $request)
    {
        $query = Enrollment::with(['student', 'course', 'semester']);

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('course_id')) {
            $query->where('course_id', $request->course_id);
        }

        if ($request->has('semester_id')) {
            $query->where('semester_id', $request->semester_id);
        }

        // Search by student name or number
        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('student', function ($q) use ($search) {
                $q->where('name_en', 'like', "%$search%")
                    ->orWhere('name_ar', 'like', "%$search%")
                    ->orWhere('student_number', 'like', "%$search%");
            });
        }

        return response()->json($query->orderBy('created_at', 'desc')->paginate(20));
    }

    /**
     * Update the grade for a specific enrollment.
     */
    public function updateGrade(Request $request, $id)
    {
        $enrollment = Enrollment::findOrFail($id);

        $validated = $request->validate([
            'midterm_grade' => 'nullable|numeric|min:0|max:15',
            'practical_grade' => 'nullable|numeric|min:0|max:15',
            'year_work_grade' => 'nullable|numeric|min:0|max:10',
            'final_exam_grade' => 'nullable|numeric|min:0|max:60',
            'status' => 'nullable|in:registered,withdrawn,completed,incomplete,continuing',
        ]);

        $total = ($validated['midterm_grade'] ?? 0) +
            ($validated['practical_grade'] ?? 0) +
            ($validated['year_work_grade'] ?? 0) +
            ($validated['final_exam_grade'] ?? 0);

        // Calculate symbol and points based on total (out of 100)
        $percentage = $total;

        $symbol = 'F';
        $points = 0.0;

        if ($percentage >= 90) {
            $symbol = 'A';
            $points = 4.0;
        } elseif ($percentage >= 85) {
            $symbol = 'A-';
            $points = 3.7;
        } elseif ($percentage >= 80) {
            $symbol = 'B+';
            $points = 3.3;
        } elseif ($percentage >= 75) {
            $symbol = 'B';
            $points = 3.0;
        } elseif ($percentage >= 70) {
            $symbol = 'C+';
            $points = 2.7;
        } elseif ($percentage >= 65) {
            $symbol = 'C';
            $points = 2.4;
        } elseif ($percentage >= 60) {
            $symbol = 'D';
            $points = 2.0;
        }

        $enrollment->update([
            'midterm_grade' => $validated['midterm_grade'],
            'practical_grade' => $validated['practical_grade'],
            'year_work_grade' => $validated['year_work_grade'],
            'final_exam_grade' => $validated['final_exam_grade'],
            'grade' => $total,
            'grade_symbol' => $symbol,
            'grade_points' => $points,
            'status' => $validated['status'] ?? 'completed'
        ]);

        $this->recalculateGPA($enrollment->student_id);

        return response()->json([
            'message' => 'Grade updated successfully',
            'enrollment' => $enrollment->load(['student', 'course'])
        ]);
    }

    /**
     * Recalculate Student cumulative GPA and passed hours.
     */
    private function recalculateGPA($studentId)
    {
        $records = Enrollment::where('student_id', $studentId)
            ->where('status', 'completed')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->select('enrollments.grade_points', 'courses.credit_hours')
            ->get();

        if ($records->isEmpty())
            return;

        $totalPoints = 0;
        $totalHours = 0;
        $passedHours = 0;

        foreach ($records as $record) {
            $totalPoints += ($record->grade_points * $record->credit_hours);
            $totalHours += $record->credit_hours;
            if ($record->grade_points > 0) {
                $passedHours += $record->credit_hours;
            }
        }

        $cgpa = $totalHours > 0 ? ($totalPoints / $totalHours) : 0;

        Student::where('id', $studentId)->update([
            'cgpa' => round($cgpa, 3),
            'total_passed_hrs' => $passedHours
        ]);
    }
    /**
     * Export student academic transcript as CSV.
     */
    public function exportTranscript($studentId)
    {
        $student = Student::with('department')->findOrFail($studentId);
        $enrollments = Enrollment::where('student_id', $studentId)
            ->with(['course', 'semester'])
            ->orderBy('semester_id', 'asc')
            ->get();

        $filename = "Transcript_" . $student->student_number . ".csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($student, $enrollments) {
            $file = fopen('php://output', 'w');

            // Add UTF-8 BOM for Excel to recognize Arabic characters
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));

            // Student Info Header
            fputcsv($file, ['Academic Transcript']);
            fputcsv($file, ['Student Name', $student->name_en . " (" . $student->name_ar . ")"]);
            fputcsv($file, ['Student ID', $student->student_number]);
            fputcsv($file, ['National ID', $student->national_id]);
            fputcsv($file, ['Department', $student->department->name_en ?? 'N/A']);
            fputcsv($file, ['Level', $student->level]);
            fputcsv($file, ['Cumulative GPA', $student->cgpa]);
            fputcsv($file, ['Total Passed Hours', $student->total_passed_hrs]);
            fputcsv($file, []); // Empty line

            // Table Header
            fputcsv($file, ['Semester', 'Course Code', 'Course Name', 'Credits', 'Midterm (15)', 'Practical (15)', 'Year Work (10)', 'Final Exam (60)', 'Total Grade', 'Grade Points', 'Symbol', 'Status']);

            foreach ($enrollments as $reg) {
                fputcsv($file, [
                    $reg->semester ? $reg->semester->year . " - " . $reg->semester->term : 'N/A',
                    $reg->course->code_en ?? 'N/A',
                    $reg->course->name_en ?? 'N/A',
                    $reg->course->credit_hours ?? 0,
                    $reg->midterm_grade ?? 0,
                    $reg->practical_grade ?? 0,
                    $reg->year_work_grade ?? 0,
                    $reg->final_exam_grade ?? 0,
                    $reg->grade ?? '--',
                    $reg->grade_points ?? '--',
                    $reg->grade_symbol ?? '--',
                    $reg->status
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
    /**
     * Import students and grades from CSV.
     */
    public function importData(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        $data = array_map('str_getcsv', file($path));

        // Skip header row
        $header = array_shift($data);

        $results = [
            'success' => 0,
            'errors' => []
        ];

        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                if (count($row) < 10)
                    continue;

                // Expected columns: 
                // 0:student_number, 1:national_id, 2:name_en, 3:name_ar, 4:level, 5:dept_code, 6:course_code, 7:year, 8:term, 9:total_grade
                // 10:midterm_grade, 11:practical_grade, 12:year_work_grade, 13:final_exam_grade
                $student_num = trim($row[0]);
                $national_id = trim($row[1]);
                $name_en = trim($row[2]);
                $name_ar = trim($row[3]);
                $level = trim($row[4]);
                $dept_code = trim($row[5]);
                $course_code = trim($row[6]);
                $year = trim($row[7]);
                $term = strtolower(trim($row[8]));
                $total_grade = trim($row[9]);

                $midterm = isset($row[10]) ? trim($row[10]) : null;
                $practical = isset($row[11]) ? trim($row[11]) : null;
                $year_work = isset($row[12]) ? trim($row[12]) : null;
                $final_exam = isset($row[13]) ? trim($row[13]) : null;

                // 1. Find or Create Student
                $student = Student::updateOrCreate(
                    ['student_number' => $student_num],
                    [
                        'national_id' => $national_id,
                        'name_en' => $name_en ?: 'Student ' . $student_num,
                        'name_ar' => $name_ar ?: ($name_en ?: 'طالب ' . $student_num),
                        'level' => is_numeric($level) ? $level : 1,
                        'department_id' => DB::table('departments')->where('code', $dept_code)->value('id'),
                        'is_first_term' => 0
                    ]
                );

                // Ensure user account exists
                if (!DB::table('users')->where('username', $student_num)->exists()) {
                    DB::table('users')->insert([
                        'username' => $student_num,
                        'password_hash' => password_hash('12345678', PASSWORD_DEFAULT),
                        'role' => 'student',
                        'student_id' => $student->id,
                        'created_at' => now()
                    ]);
                }

                // 2. Find Course
                $course = Course::where('code_en', $course_code)->first();
                if (!$course) {
                    $results['errors'][] = "Row " . ($index + 2) . ": Course $course_code not found.";
                    continue;
                }

                // 3. Find Semester
                $semester = Semester::where('year', $year)->where('term', $term)->first();
                if (!$semester) {
                    $semester = Semester::create(['year' => $year, 'term' => $term, 'is_active' => 0]);
                }

                // 4. Upsert Enrollment
                // Calculate symbol and points based on total_grade (if provided) or sum of components
                $final_grade = $total_grade;
                if ($final_grade === "" && ($midterm !== null || $practical !== null || $year_work !== null || $final_exam !== null)) {
                    $final_grade = ($midterm ?? 0) + ($practical ?? 0) + ($year_work ?? 0) + ($final_exam ?? 0);
                }

                $points = 0;
                $symbol = 'F';
                if ($final_grade >= 90) {
                    $symbol = 'A';
                    $points = 4.0;
                } else if ($final_grade >= 80) {
                    $symbol = 'B';
                    $points = 3.3;
                } else if ($final_grade >= 70) {
                    $symbol = 'C';
                    $points = 2.4;
                } else if ($final_grade >= 60) {
                    $symbol = 'D';
                    $points = 2.0;
                }

                DB::table('enrollments')->updateOrInsert(
                    ['student_id' => $student->id, 'course_id' => $course->id, 'semester_id' => $semester->id],
                    [
                        'grade' => $final_grade,
                        'midterm_grade' => $midterm,
                        'practical_grade' => $practical,
                        'year_work_grade' => $year_work,
                        'final_exam_grade' => $final_exam,
                        'grade_points' => $points,
                        'grade_symbol' => $symbol,
                        'status' => 'completed',
                        'created_at' => now()
                    ]
                );

                $results['success']++;
            }

            DB::commit();

            // Final step: recalculate GPA for all students mentioned
            $uniqueStudentIds = Student::whereIn('student_number', array_column($data, 0))->pluck('id');
            foreach ($uniqueStudentIds as $sId) {
                $this->recalculateGPA($sId);
            }

            return response()->json([
                'message' => "Import complete. Successfully processed " . $results['success'] . " records.",
                'errors' => $results['errors']
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => "Error during import: " . $e->getMessage()], 500);
        }
    }
}
