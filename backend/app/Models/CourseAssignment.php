<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CourseAssignment extends Model
{
    protected $fillable = [
        'course_id',
        'professor_id',
        'semester_id'
    ];

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function professor()
    {
        return $this->belongsTo(Professor::class);
    }

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }
}
