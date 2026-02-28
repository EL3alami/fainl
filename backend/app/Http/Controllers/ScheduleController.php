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

        // 2. Get all assignments for the active semester with course details
        $assignments = CourseAssignment::join('courses', 'course_assignments.course_id', '=', 'courses.id')
            ->where('course_assignments.semester_id', $activeSemester->id)
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

        // Track occupancy: [day][slot_index][room] = true
        $roomOccupancy = [];
        // Track level constraints: [day][slot_index][level] = true
        $levelOccupancy = [];

        foreach ($assignments as $assignment) {
            $assigned = false;

            // Try to find a valid slot
            for ($d = 0; $d < count($days); $d++) {
                for ($s = 0; $s < count($slots); $s++) {
                    $level = $assignment->level ?? 1;

                    // Check if this level is already busy at this time
                    if (isset($levelOccupancy[$days[$d]][$s][$level]))
                        continue;

                    // Try to find an empty room
                    foreach ($rooms as $room) {
                        if (!isset($roomOccupancy[$days[$d]][$s][$room])) {
                            // Found a spot!
                            Schedule::create([
                                'course_id' => $assignment->course_id,
                                'professor_id' => $assignment->professor_id,
                                'semester_id' => $activeSemester->id,
                                'day' => $days[$d],
                                'start_time' => $slots[$s][0],
                                'end_time' => $slots[$s][1],
                                'room' => $room,
                                'type' => 'lecture'
                            ]);

                            $roomOccupancy[$days[$d]][$s][$room] = true;
                            $levelOccupancy[$days[$d]][$s][$level] = true;
                            $generated++;
                            $assigned = true;
                            break 2; // Break slot and room loops
                        }
                    }
                }
            }
        }

        return response()->json([
            'message' => "Successfully generated $generated schedules. Level conflicts and room overlaps were avoided.",
            'schedules' => Schedule::with(['course', 'professor', 'semester'])->where('semester_id', $activeSemester->id)->get()
        ]);
    }

    public function delete($id)
    {
        Schedule::destroy($id);
        return response()->json(['message' => 'Schedule removed']);
    }
}
