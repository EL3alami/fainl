<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'code_ar',
        'code_en',
        'name_ar',
        'name_en',
        'credit_hours',
        'lecture_hrs',
        'lab_hrs',
        'level',
        'course_type',
        'department_id',
        'is_available'
    ];
    public $timestamps = false;

    protected $casts = [
        'is_available' => 'boolean'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
