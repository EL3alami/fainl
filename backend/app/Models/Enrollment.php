<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Enrollment extends Model
{
    protected $fillable = [
        'student_id',
        'course_id',
        'semester_id',
        'grade',
        'midterm_grade',
        'practical_grade',
        'year_work_grade',
        'final_exam_grade',
        'grade_points',
        'grade_symbol',
        'status',
        'is_repeat'
    ];

    public $timestamps = false;

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
