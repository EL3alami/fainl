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

        // Courses student hasn't passed yet
        $passedCourseIds = Enrollment::where('student_id', $studentId)
            ->where('status', 'completed')
            ->where('grade', '>=', 60)
            ->pluck('course_id');

        // Get courses for student level or lower
        $courses = Course::where('level', '<=', $student->level)
            ->whereNotIn('id', $passedCourseIds)
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
                $available[] = $course;
            }
        }

        return response()->json($available);
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

        // For each enrollment, attach the master schedule info
        foreach ($enrollments as $enrollment) {
            $schedule = \App\Models\Schedule::where('course_id', $enrollment->course_id)
                ->where('semester_id', $activeSemester->id)
                ->with('professor')
                ->first();
            $enrollment->schedule_info = $schedule;
        }

        return response()->json($enrollments);
    }

    /**
     * Admin: Get all student registrations for a specific semester
     */
    public function getAllRegistrations($semesterId)
    {
        $enrollments = Enrollment::where('semester_id', $semesterId)
            ->with(['student.department', 'course'])
            ->get();

        return response()->json($enrollments);
    }
}
