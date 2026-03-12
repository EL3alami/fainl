<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add indexes to students
        Schema::table('students', function (Blueprint $table) {
            $table->index('department_id', 'idx_students_department');
            $table->index('level', 'idx_students_level');
            $table->index('national_id', 'idx_students_national_id');
        });

        // Add indexes to courses
        Schema::table('courses', function (Blueprint $table) {
            $table->index('department_id', 'idx_courses_department');
            $table->index('level', 'idx_courses_level');
            $table->index('is_available', 'idx_courses_available');
        });

        // Add indexes to enrollments
        Schema::table('enrollments', function (Blueprint $table) {
            $table->index('student_id', 'idx_enrollments_student');
            $table->index('course_id', 'idx_enrollments_course');
            $table->index('semester_id', 'idx_enrollments_semester');
            $table->index('status', 'idx_enrollments_status');
        });

        // Add indexes to course_assignments
        Schema::table('course_assignments', function (Blueprint $table) {
            $table->index('course_id', 'idx_assignments_course');
            $table->index('professor_id', 'idx_assignments_professor');
            $table->index('semester_id', 'idx_assignments_semester');
        });

        // Add indexes to schedules
        Schema::table('schedules', function (Blueprint $table) {
            $table->index('course_id', 'idx_schedules_course');
            $table->index('professor_id', 'idx_schedules_professor');
            $table->index('semester_id', 'idx_schedules_semester');
            $table->index('day', 'idx_schedules_day');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('students', function (Blueprint $table) {
            $table->dropIndex('idx_students_department');
            $table->dropIndex('idx_students_level');
            $table->dropIndex('idx_students_national_id');
        });

        Schema::table('courses', function (Blueprint $table) {
            $table->dropIndex('idx_courses_department');
            $table->dropIndex('idx_courses_level');
            $table->dropIndex('idx_courses_available');
        });

        Schema::table('enrollments', function (Blueprint $table) {
            $table->dropIndex('idx_enrollments_student');
            $table->dropIndex('idx_enrollments_course');
            $table->dropIndex('idx_enrollments_semester');
            $table->dropIndex('idx_enrollments_status');
        });

        Schema::table('course_assignments', function (Blueprint $table) {
            $table->dropIndex('idx_assignments_course');
            $table->dropIndex('idx_assignments_professor');
            $table->dropIndex('idx_assignments_semester');
        });

        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex('idx_schedules_course');
            $table->dropIndex('idx_schedules_professor');
            $table->dropIndex('idx_schedules_semester');
            $table->dropIndex('idx_schedules_day');
        });
    }
};
