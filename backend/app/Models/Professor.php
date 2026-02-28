<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Professor extends Model
{
    public $timestamps = false; // تعطيل التوقيت التلقائي لأن الجدول لا يحتوي على updated_at

    protected $fillable = [
        'name_ar',
        'name_en',
        'email',
        'department_id',
        'title',
        'specialization',
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
