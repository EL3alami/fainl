<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semester;
use App\Models\Student;
use App\Models\Course;
use App\Models\Enrollment;

class AcademicSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Semesters
        $s1 = Semester::create([
            'year' => 2024,
            'term' => 'fall',
            'start_date' => '2024-09-01',
            'end_date' => '2025-01-15',
            'is_active' => false
        ]);

        $s2 = Semester::create([
            'year' => 2025,
            'term' => 'spring',
            'start_date' => '2025-02-10',
            'end_date' => '2025-06-20',
            'is_active' => true
        ]);

        // 2. Create some sample Enrollments
        $students = Student::limit(5)->get();
        $courses = Course::limit(10)->get();

        if ($students->count() > 0 && $courses->count() > 0) {
            foreach ($students as $student) {
                // Enroll each student in 3 random courses for the active semester
                $randomCourses = $courses->random(3);
                foreach ($randomCourses as $course) {
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'semester_id' => $s2->id,
                        'status' => 'registered'
                    ]);
                }

                // Add some completed grades for the previous semester
                $pastCourses = $courses->random(2);
                foreach ($pastCourses as $course) {
                    Enrollment::create([
                        'student_id' => $student->id,
                        'course_id' => $course->id,
                        'semester_id' => $s1->id,
                        'grade' => rand(65, 95),
                        'grade_points' => 3.5,
                        'grade_symbol' => 'B+',
                        'status' => 'completed'
                    ]);
                }
            }
        }
    }
}
