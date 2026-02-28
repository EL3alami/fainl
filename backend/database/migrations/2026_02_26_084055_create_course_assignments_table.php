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
        Schema::create('course_assignments', function (Blueprint $table) {
            $table->id();
            $table->integer('course_id');
            $table->integer('professor_id');
            $table->integer('semester_id');
            $table->timestamps();

            // Note: Since the existing DB uses integer for IDs, we'll stick to that.
            // In a full Laravel migration we might use foreignId().
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('course_assignments');
    }
};
