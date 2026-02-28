<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public $timestamps = false; // تعطيل التوقيت التلقائي لأن الجدول لا يحتوي على updated_at

    protected $table = 'users';

    protected $fillable = [
        'username',
        'password_hash',
        'role',
        'student_id',
        'professor_id',
        'is_active',
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    // Laravel يستخدم 'password' افتراضياً — نخبره باسم العمود الحقيقي
    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    // علاقة مع جدول الطلاب (بدون import مباشر لتفادي لأن Model غير منشأة بعد)
    public function student()
    {
        return $this->belongsTo(\App\Models\Student::class, 'student_id');
    }

    // علاقة مع جدول الأساتذة
    public function professor()
    {
        return $this->belongsTo(\App\Models\Professor::class, 'professor_id');
    }
}
