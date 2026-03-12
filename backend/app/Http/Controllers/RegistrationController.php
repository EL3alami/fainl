<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RegistrationController extends Controller
{
    /**
     * Verify student by National ID and Student Number
     */
    public function verify(Request $request)
    {
        $validated = $request->validate([
            'national_id' => 'required|string',
            'student_number' => 'required|string',
        ]);

        $student = Student::with('department')
            ->where('national_id', $validated['national_id'])
            ->where('student_number', $validated['student_number'])
            ->first();

        if (!$student) {
            return response()->json(['message' => 'Student not found. Please check your credentials.'], 404);
        }

        // Get active semester
        $semester = Semester::where('is_active', true)->first();

        return response()->json([
            'student' => $student,
            'semester' => $semester
        ]);
    }

    /**
     * Get available courses for the student
     */
    public function getAvailableCourses($studentId)
    {
        $student = Student::findOrFail($studentId);
        $activeSemester = Semester::where('is_active', true)->first();

        if (!$activeSemester) {
            return response()->json(['message' => 'No active registration period.'], 400);
        }

        $now = now()->toDateString();
        if ($activeSemester->reg_start && $activeSemester->reg_start > $now) {
            return response()->json(['message' => 'Registration period has not started yet.'], 400);
        }
        if ($activeSemester->reg_end && $activeSemester->reg_end < $now) {
            return response()->json(['message' => 'Registration period has ended.'], 400);
        }

        // Courses student has passed or is currently registered for
        $excludedCourseIds = Enrollment::where('student_id', $studentId)
            ->where(function ($q) {
                $q->where(function ($query) {
                    // Passed courses
                    $query->where('status', 'completed')
                        ->where('grade', '>=', 60);
                })
                    ->orWhereIn('status', ['registered', 'continuing', 'incomplete']); // Still ongoing
            })
            ->pluck('course_id');

        // Courses offered this term (assigned to a professor)
        $assignments = \App\Models\CourseAssignment::with([
            'professor' => function ($q) {
                $q->select('id', 'name_en', 'name_ar', 'title');
            }
        ])->where('semester_id', $activeSemester->id)
            ->get()
            ->keyBy('course_id');

        $offeredCourseIds = $assignments->keys();

        // Get courses marked as available, exclude ongoing/passed
        $courses = Course::where('is_available', true)
            ->where('level', '<=', $student->level)
            ->whereNotIn('id', $excludedCourseIds)
            ->with('department')
            ->get();

        // For each course, check if student meets prerequisites
        // (This is a simplified check, the real check happens during registration)
        $available = [];
        foreach ($courses as $course) {
            $prereqIds = DB::table('prerequisites')->where('course_id', $course->id)->pluck('prereq_id');
            $metCount = DB::table('enrollments')
                ->where('student_id', $studentId)
                ->whereIn('course_id', $prereqIds)
                ->where('status', 'completed')
                ->where('grade', '>=', 60)
                ->count();

            if ($metCount == count($prereqIds)) {
                if (isset($assignments[$course->id])) {
                    $course->professor = $assignments[$course->id]->professor;
                }
                $available[] = $course;
            }
        }

        // Calculate max hours based on CGPA and term (using the DB function)
        try {
            $maxCreditsResult = DB::select('SELECT get_max_credits(?, ?) AS max_credits', [$studentId, $activeSemester->id]);
            $max_hours = $maxCreditsResult[0]->max_credits ?? 18;
        } catch (\Exception $e) {
            $max_hours = 18;
        }

        // Calculate registered hours for this term
        $registered_hours = DB::table('enrollments')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->where('enrollments.student_id', $studentId)
            ->where('enrollments.semester_id', $activeSemester->id)
            ->whereIn('enrollments.status', ['registered', 'continuing', 'incomplete'])
            ->sum('courses.credit_hours');

        return response()->json([
            'available' => $available,
            'max_hours' => (int) $max_hours,
            'registered_hours' => (int) $registered_hours
        ]);
    }

    /**
     * Register a course
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $semester = Semester::findOrFail($validated['semester_id']);
        $now = now()->toDateString();

        if ($semester->reg_start && $semester->reg_start > $now) {
            return response()->json(['message' => 'Registration period has not started yet.'], 400);
        }
        if ($semester->reg_end && $semester->reg_end < $now) {
            return response()->json(['message' => 'Registration period has ended.'], 400);
        }

        $course = Course::findOrFail($validated['course_id']);
        if (!$course->is_available) {
            return response()->json(['message' => 'This course is currently suspended and not available for registration.'], 422);
        }

        // Call the stored procedure
        $result = DB::select('CALL can_register_course(?, ?, ?, @p_result, @p_reason)', [
            $validated['student_id'],
            $validated['course_id'],
            $validated['semester_id']
        ]);

        $status = DB::select('SELECT @p_result as result, @p_reason as reason')[0];

        if ($status->result == 0) {
            return response()->json(['message' => $status->reason], 422);
        }

        // Check if already registered in THIS semester
        $exists = Enrollment::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('semester_id', $validated['semester_id'])
            ->exists();

        if ($exists) {
            return response()->json(['message' => 'You are already registered for this course.'], 422);
        }

        DB::table('enrollments')->insert([
            'student_id' => $validated['student_id'],
            'course_id' => $validated['course_id'],
            'semester_id' => $validated['semester_id'],
            'status' => 'registered',
            'created_at' => now()
        ]);

        return response()->json(['message' => 'Course registered successfully!']);
    }

    /**
     * Unregister a course
     */
    public function unregister(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'course_id' => 'required|exists:courses,id',
            'semester_id' => 'required|exists:semesters,id',
        ]);

        $semester = Semester::findOrFail($validated['semester_id']);
        $now = now()->toDateString();

        if ($semester->reg_start && $semester->reg_start > $now) {
            return response()->json(['message' => 'Registration period has not started yet.'], 400);
        }
        if ($semester->reg_end && $semester->reg_end < $now) {
            return response()->json(['message' => 'Registration period has ended. You cannot unregister now.'], 400);
        }

        $deleted = Enrollment::where('student_id', $validated['student_id'])
            ->where('course_id', $validated['course_id'])
            ->where('semester_id', $validated['semester_id'])
            ->delete();

        if ($deleted) {
            return response()->json(['message' => 'Course unregistered successfully!']);
        }

        return response()->json(['message' => 'Course not found in your registration.'], 404);
    }

    /**
     * Get student's registered courses for current semester
     */
    public function getMyCourses($studentId)
    {
        $activeSemester = Semester::where('is_active', true)->first();
        if (!$activeSemester)
            return response()->json([]);

        $enrollments = Enrollment::where('student_id', $studentId)
            ->where('semester_id', $activeSemester->id)
            ->with(['course'])
            ->get();

        // For each enrollment, attach the master schedule info and professor
        foreach ($enrollments as $enrollment) {
            $schedule = \App\Models\Schedule::where('course_id', $enrollment->course_id)
                ->where('semester_id', $activeSemester->id)
                ->with('professor')
                ->first();
            $enrollment->schedule_info = $schedule;

            $assignment = \App\Models\CourseAssignment::where('course_id', $enrollment->course_id)
                ->where('semester_id', $activeSemester->id)
                ->with('professor')
                ->first();
            $enrollment->assigned_professor = $assignment ? $assignment->professor : null;
        }

        return response()->json($enrollments);
    }

    /**
     * Admin: Get all student registrations for a specific semester
     */
    public function getAllRegistrations(Request $request, $semesterId)
    {
        $query = Enrollment::where('semester_id', $semesterId)
            ->with(['student.department', 'course']);

        if ($request->has('level')) {
            $level = $request->level;
            $query->whereHas('student', function ($q) use ($level) {
                $q->where('level', $level);
            });
        }

        $enrollments = $query->get();

        $assignments = \App\Models\CourseAssignment::where('semester_id', $semesterId)
            ->with('professor')
            ->get()
            ->keyBy('course_id');

        foreach ($enrollments as $enrollment) {
            $enrollment->assigned_professor = isset($assignments[$enrollment->course_id]) ? $assignments[$enrollment->course_id]->professor : null;
        }

        return response()->json($enrollments);
    }

    /**
     * Admin: Export student registrations as CSV.
     */
    public function exportRegistrations(Request $request)
    {
        $semesterId = $request->query('semester_id');
        $studentId = $request->query('student_id');
        $level = $request->query('level');

        $semester = Semester::findOrFail($semesterId);

        $query = Enrollment::where('semester_id', $semesterId)
            ->with(['student.department', 'course'])
            ->orderBy('student_id', 'asc');

        if ($studentId) {
            $query->where('student_id', $studentId);
        }

        if ($level) {
            $query->whereHas('student', function ($q) use ($level) {
                $q->where('level', $level);
            });
        }

        $enrollments = $query->get();

        $filename = "Registration_Report_" . ($level ? "Level_{$level}_" : "") . ($studentId ? "Student_{$studentId}_" : "") . "{$semester->year}.csv";

        $headers = [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ];

        $callback = function () use ($semester, $enrollments) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF)); // UTF-8 BOM

            // Header Info
            fputcsv($file, ['Course Registration Report']);
            fputcsv($file, ['Semester', "{$semester->year} - {$semester->term}"]);
            fputcsv($file, ['Export Date', now()->toDateTimeString()]);
            fputcsv($file, []); // Empty line

            // Table Header
            fputcsv($file, ['Student Name', 'Student ID', 'National ID', 'Level', 'Department', 'Course Code', 'Course Name', 'Credits', 'Status', 'Registration Date']);

            foreach ($enrollments as $reg) {
                fputcsv($file, [
                    $reg->student->name_en ?? $reg->student->name_ar,
                    $reg->student->student_number,
                    $reg->student->national_id,
                    $reg->student->level,
                    optional($reg->student->department)->name_en ?? 'General',
                    $reg->course->code_en ?? 'N/A',
                    $reg->course->name_en ?? 'N/A',
                    $reg->course->credit_hours ?? 0,
                    strtoupper($reg->status),
                    $reg->created_at ? (is_string($reg->created_at) ? $reg->created_at : $reg->created_at->toDateTimeString()) : 'N/A'
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
