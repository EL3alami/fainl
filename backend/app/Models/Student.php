<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    public $timestamps = false; // تعطيل التوقيت التلقائي لأن الجدول لا يحتوي على updated_at

    protected $fillable = [
        'student_number',
        'national_id',
        'name_ar',
        'name_en',
        'email',
        'department_id',
        'level',
        'cgpa',
        'total_passed_hrs',
        'is_first_term',
        'academic_warnings',
        'status'
    ];

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function user()
    {
        return $this->hasOne(User::class);
    }
}
