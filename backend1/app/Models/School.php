<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class School extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'npsn',
        'status',
        'verified_at',
        'registration_link'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    // Relasi ke users (admin sekolah)
    public function admins()
    {
        return $this->hasMany(User::class)->where('role', 'school_admin');
    }

    // Relasi ke registrations (pendaftar)
    public function registrations()
    {
        return $this->hasMany(Registration::class);
    }

    // Generate registration link
    public function generateRegistrationLink()
    {
        // Generate random token
        $this->registration_link = \Str::random(32);
        $this->save();
        return $this->registration_link;
    }
}