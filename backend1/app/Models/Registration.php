<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'school_id',
        'period_id',
        'program',
        'academic_year',
        'status',
        'form_data'
    ];

    protected $casts = [
        'form_data' => 'array',
    ];

    // Relasi ke student
    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    // Relasi ke sekolah
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    // Relasi ke periode pendaftaran
    public function period()
    {
        return $this->belongsTo(RegistrationPeriod::class, 'period_id');
    }

    // Relasi ke files
    public function files()
    {
        return $this->hasMany(RegistrationFile::class);
    }
}