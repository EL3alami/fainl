<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    /**
     * Display a listing of the courses.
     */
    public function index()
    {
        // We load the department name with the course
        return response()->json(Course::with('department')->get());
    }

    /**
     * Store a newly created course in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'code_ar' => 'nullable|string|max:30',
            'code_en' => 'required|string|max:20|unique:courses,code_en',
            'name_ar' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'credit_hours' => 'required|integer|min:0|max:10',
            'lecture_hrs' => 'nullable|integer|min:0',
            'lab_hrs' => 'nullable|integer|min:0',
            'level' => 'required|integer|min:1|max:4',
            'course_type' => 'required|in:general_mandatory,general_elective,college_mandatory,college_elective,dept_mandatory,dept_elective,project,training,remedial',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $course = Course::create($validated);
        return response()->json([
            'message' => 'Course created successfully',
            'course' => $course->load('department')
        ], 201);
    }

    /**
     * Display the specified course.
     */
    public function show(Course $course)
    {
        return response()->json($course->load('department'));
    }

    /**
     * Update the specified course in storage.
     */
    public function update(Request $request, Course $course)
    {
        $validated = $request->validate([
            'code_ar' => 'nullable|string|max:30',
            'code_en' => 'required|string|max:20|unique:courses,code_en,' . $course->id,
            'name_ar' => 'required|string|max:200',
            'name_en' => 'required|string|max:200',
            'credit_hours' => 'required|integer|min:0|max:10',
            'lecture_hrs' => 'nullable|integer|min:0',
            'lab_hrs' => 'nullable|integer|min:0',
            'level' => 'required|integer|min:1|max:4',
            'course_type' => 'required|in:general_mandatory,general_elective,college_mandatory,college_elective,dept_mandatory,dept_elective,project,training,remedial',
            'department_id' => 'nullable|exists:departments,id',
        ]);

        $course->update($validated);
        return response()->json([
            'message' => 'Course updated successfully',
            'course' => $course->load('department')
        ]);
    }

    /**
     * Remove the specified course from storage.
     */
    public function destroy(Course $course)
    {
        // Check if there are enrollments for this course
        $enrollmentCount = DB::table('enrollments')->where('course_id', $course->id)->count();
        if ($enrollmentCount > 0) {
            return response()->json([
                'message' => 'Cannot delete course: it is associated with active enrollments.'
            ], 422);
        }

        $course->delete();
        return response()->json(['message' => 'Course deleted successfully']);
    }
}
