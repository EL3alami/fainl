<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Semester extends Model
{
    protected $fillable = ['year', 'term', 'start_date', 'end_date', 'reg_start', 'reg_end', 'is_active'];
    public $timestamps = false;
}
