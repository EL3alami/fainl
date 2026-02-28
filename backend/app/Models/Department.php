<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name_ar', 'name_en', 'code', 'description_ar', 'description_en'];
    public $timestamps = false; // الجدول في الـ SQL ملوش timestamps

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function professors()
    {
        return $this->hasMany(Professor::class);
    }

    public function courses()
    {
        return $this->hasMany(Course::class);
    }
}
