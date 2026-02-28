<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'course_id',
        'professor_id',
        'semester_id',
        'day',
        'start_time',
        'end_time',
        'room',
        'type'
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
