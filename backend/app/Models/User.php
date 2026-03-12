<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';
    public $timestamps = false;

    protected $fillable = [
        'username',
        'password_hash',
        'role',
        'student_id',
        'professor_id',
        'is_active',
        'last_login'
    ];

    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    // Since we use 'password_hash' instead of 'password'
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    // New format for casts (Laravel 11+)
    protected function casts(): array
    {
        return [
            'password_hash' => 'hashed',
            'is_active' => 'boolean',
            'last_login' => 'datetime',
        ];
    }
}
