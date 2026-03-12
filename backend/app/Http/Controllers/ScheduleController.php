<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Schedule;
use App\Models\CourseAssignment;
use App\Models\Semester;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index()
    {
        return response()->json(Schedule::with(['course', 'professor', 'semester'])->orderBy('day')->orderBy('start_time')->get());
    }

    public function generate()
    {
        $activeSemester = Semester::where('is_active', 1)->first();
        if (!$activeSemester) {
            return response()->json(['message' => 'No active semester found'], 400);
        }

        // 1. Clear current schedules for active semester
        Schedule::where('semester_id', $activeSemester->id)->delete();

        // 2. Get courses actually registered by students this term
        $registeredCourseIds = \App\Models\Enrollment::where('semester_id', $activeSemester->id)
            ->pluck('course_id')
            ->unique()
            ->toArray();

        // 3. Get assignments for the active semester, filtered by registered courses
        $assignments = CourseAssignment::join('courses', 'course_assignments.course_id', '=', 'courses.id')
            ->where('course_assignments.semester_id', $activeSemester->id)
            ->whereIn('course_assignments.course_id', $registeredCourseIds)
            ->select('course_assignments.*', 'courses.level', 'courses.department_id as course_dept')
            ->orderBy('courses.level')
            ->get();

        $days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
        $slots = [
            ['08:30', '10:00'],
            ['10:00', '11:30'],
            ['12:00', '01:30'],
            ['01:30', '03:00']
        ];
        $rooms = ['Hall 1', 'Hall 2', 'Hall 3', 'Hall 4', 'Lab 1', 'Lab 2'];

        $generated = 0;

        // Tracks to avoid conflicts
        $roomOccupancy = [];
        $levelOccupancy = [];
        $profOccupancy = []; // Avoid double booking the same professor

        foreach ($assignments as $assignment) {
            $assigned = false;

            for ($d = 0; $d < count($days); $d++) {
                for ($s = 0; $s < count($slots); $s++) {
                    $level = $assignment->level ?? 1;
                    $prof = $assignment->professor_id;
                    $dayStr = $days[$d];

                    // Check if Level is busy
                    if (isset($levelOccupancy[$dayStr][$s][$level]))
                        continue;

                    // Check if Professor is busy
                    if ($prof && isset($profOccupancy[$dayStr][$s][$prof]))
                        continue;

                    // Find an empty room
                    foreach ($rooms as $room) {
                        if (!isset($roomOccupancy[$dayStr][$s][$room])) {
                            // Assign!
                            Schedule::create([
                                'course_id' => $assignment->course_id,
                                'professor_id' => $prof,
                                'semester_id' => $activeSemester->id,
                                'day' => $dayStr,
                                'start_time' => $slots[$s][0],
                                'end_time' => $slots[$s][1],
                                'room' => $room,
                                'type' => 'lecture'
                            ]);

                            $roomOccupancy[$dayStr][$s][$room] = true;
                            $levelOccupancy[$dayStr][$s][$level] = true;
                            if ($prof) {
                                $profOccupancy[$dayStr][$s][$prof] = true;
                            }

                            $generated++;
                            $assigned = true;
                            break 2; // Break out of room & slot loops
                        }
                    }
                }
                if ($assigned)
                    break; // Break out of day loop
            }
        }

        return response()->json([
            'message' => "Successfully generated $generated schedules for registered courses. Conflicts (Rooms, Level, Professor) were avoided.",
            'schedules' => Schedule::with(['course', 'professor', 'semester'])->where('semester_id', $activeSemester->id)->get()
        ]);
    }

    public function delete($id)
    {
        Schedule::destroy($id);
        return response()->json(['message' => 'Schedule removed']);
    }
}
