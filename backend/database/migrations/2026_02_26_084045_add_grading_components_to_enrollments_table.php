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
        Schema::table('enrollments', function (Blueprint $table) {
            $table->decimal('midterm_grade', 5, 2)->nullable()->after('semester_id');
            $table->decimal('practical_grade', 5, 2)->nullable()->after('midterm_grade');
            $table->decimal('year_work_grade', 5, 2)->nullable()->after('practical_grade');
            $table->decimal('final_exam_grade', 5, 2)->nullable()->after('year_work_grade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enrollments', function (Blueprint $table) {
            //
        });
    }
};
