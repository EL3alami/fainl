<?php

namespace App\Http\Controllers;

use App\Models\Professor;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ProfessorController extends Controller
{
    // عرض كل الأساتذة
    public function index()
    {
        return response()->json(Professor::with(['department', 'user'])->get());
    }

    // إضافة أستاذ جديد
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_ar' => 'required',
            'name_en' => 'nullable',
            'username' => 'required|unique:users,username',
            'email' => 'required|email|unique:professors,email',
            'password' => 'required|min:6',
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|in:lecturer,assistant_prof,associate_prof,prof',
            'specialization' => 'nullable',
        ]);

        return DB::transaction(function () use ($validated) {
            // 1. إنشاء سجل الأستاذ
            $professor = Professor::create([
                'name_ar' => $validated['name_ar'],
                'name_en' => $validated['name_en'] ?? null,
                'email' => $validated['email'],
                'department_id' => $validated['department_id'],
                'title' => $validated['title'],
                'specialization' => $validated['specialization'],
            ]);

            // 2. إنشاء حساب مستخدم للأستاذ
            User::create([
                'username' => $validated['username'],
                'password_hash' => Hash::make($validated['password']),
                'role' => 'professor',
                'professor_id' => $professor->id,
            ]);

            return response()->json($professor->load(['department', 'user']), 201);
        });
    }

    // تعديل بيانات أستاذ
    public function update(Request $request, $id)
    {
        $professor = Professor::findOrFail($id);
        $user = User::where('professor_id', $professor->id)->firstOrFail();

        $rules = [
            'name_ar' => 'required',
            'name_en' => 'nullable',
            'username' => 'required|unique:users,username,' . $user->id,
            'email' => 'required|email|unique:professors,email,' . $professor->id,
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|in:lecturer,assistant_prof,associate_prof,prof',
            'specialization' => 'nullable',
        ];

        if ($request->filled('password')) {
            $rules['password'] = 'min:6';
        }

        $validated = $request->validate($rules);

        DB::transaction(function () use ($professor, $user, $validated) {
            $professor->update([
                'name_ar' => $validated['name_ar'],
                'name_en' => $validated['name_en'] ?? $professor->name_en,
                'email' => $validated['email'],
                'department_id' => $validated['department_id'],
                'title' => $validated['title'],
                'specialization' => $validated['specialization'],
            ]);

            $userData = ['username' => $validated['username']];
            if (isset($validated['password'])) {
                $userData['password_hash'] = Hash::make($validated['password']);
            }

            $user->update($userData);
        });

        return response()->json($professor->load(['department', 'user']));
    }

    // حذف أستاذ
    public function destroy($id)
    {
        $professor = Professor::findOrFail($id);
        User::where('professor_id', $professor->id)->delete();
        $professor->delete();
        return response()->json(['message' => 'Professor deleted successfully']);
    }

    // --- Professor Specific Methods ---

    // Get courses assigned to the professor
    public function getMyCourses($professorId)
    {
        $assignments = \App\Models\CourseAssignment::with(['course', 'semester'])
            ->where('professor_id', $professorId)
            ->get();
        return response()->json($assignments);
    }

    // Get students enrolled in a specific course assigned to the professor
    public function getCourseStudents($professorId, $courseId, $semesterId)
    {
        // Verify assignment first
        $assigned = \App\Models\CourseAssignment::where('professor_id', $professorId)
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->exists();

        if (!$assigned) {
            return response()->json(['message' => 'Unauthorized or Course not assigned'], 403);
        }

        $students = \App\Models\Enrollment::with('student')
            ->where('course_id', $courseId)
            ->where('semester_id', $semesterId)
            ->get();

        return response()->json($students);
    }

    // Get professor's timetable for the active semester
    public function getMySchedule($professorId)
    {
        $activeSemester = \App\Models\Semester::where('is_active', true)->first();
        if (!$activeSemester)
            return response()->json([]);

        $schedules = \App\Models\Schedule::where('professor_id', $professorId)
            ->where('semester_id', $activeSemester->id)
            ->with(['course'])
            ->orderBy('day')
            ->orderBy('start_time')
            ->get();

        return response()->json($schedules);
    }

    // Professor updates grades for students
    public function updateGrades(Request $request)
    {
        $validated = $request->validate([
            'enrollment_id' => 'required|exists:enrollments,id',
            'midterm_grade' => 'nullable|numeric|min:0|max:15',
            'practical_grade' => 'nullable|numeric|min:0|max:15',
            'year_work_grade' => 'nullable|numeric|min:0|max:10',
            'final_exam_grade' => 'nullable|numeric|min:0|max:60',
        ]);

        $enrollment = \App\Models\Enrollment::findOrFail($validated['enrollment_id']);

        $total = ($validated['midterm_grade'] ?? 0) +
            ($validated['practical_grade'] ?? 0) +
            ($validated['year_work_grade'] ?? 0) +
            ($validated['final_exam_grade'] ?? 0);

        // Grade mapping logic (out of 100)
        $symbol = 'F';
        $points = 0.0;

        if ($total >= 90) {
            $symbol = 'A';
            $points = 4.0;
        } elseif ($total >= 85) {
            $symbol = 'A-';
            $points = 3.7;
        } elseif ($total >= 80) {
            $symbol = 'B+';
            $points = 3.3;
        } elseif ($total >= 75) {
            $symbol = 'B';
            $points = 3.0;
        } elseif ($total >= 70) {
            $symbol = 'C+';
            $points = 2.7;
        } elseif ($total >= 65) {
            $symbol = 'C';
            $points = 2.4;
        } elseif ($total >= 60) {
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
            'status' => 'completed'
        ]);

        $this->recalculateGPA($enrollment->student_id);

        return response()->json(['message' => 'Grades updated', 'grade' => $total, 'symbol' => $symbol]);
    }

    // Admin: Assign a course to a professor
    public function assignCourse(Request $request)
    {
        $validated = $request->validate([
            'course_id' => 'required',
            'professor_id' => 'required',
            'semester_id' => 'required',
        ]);

        $assignment = \App\Models\CourseAssignment::updateOrCreate(
            ['course_id' => $validated['course_id'], 'semester_id' => $validated['semester_id']],
            ['professor_id' => $validated['professor_id']]
        );

        return response()->json($assignment->load(['course', 'professor', 'semester']), 201);
    }

    // Admin: Get all assignments
    public function getAllAssignments()
    {
        return response()->json(\App\Models\CourseAssignment::with(['course', 'professor', 'semester'])->get());
    }

    // Admin: Remove assignment
    public function removeAssignment($id)
    {
        \App\Models\CourseAssignment::destroy($id);
        return response()->json(['message' => 'Assignment removed']);
    }

    private function recalculateGPA($studentId)
    {
        $records = \App\Models\Enrollment::where('student_id', $studentId)
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

        \App\Models\Student::where('id', $studentId)->update([
            'cgpa' => round($cgpa, 3),
            'total_passed_hrs' => $passedHours
        ]);
    }
}
