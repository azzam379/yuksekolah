<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class RegistrationPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'school_id',
        'name',
        'academic_year',
        'is_open',
        'quota',
        'registered_count',
        'registration_link',
        'programs'
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'programs' => 'array',
        'quota' => 'integer',
        'registered_count' => 'integer',
    ];

    // Relasi ke sekolah
    public function school()
    {
        return $this->belongsTo(School::class);
    }

    // Relasi ke registrations
    public function registrations()
    {
        return $this->hasMany(Registration::class, 'period_id');
    }

    // Generate unique registration link
    public function generateLink()
    {
        $this->registration_link = Str::random(32);
        $this->save();
        return $this->registration_link;
    }

    // Cek apakah masih bisa menerima pendaftar
    public function canAcceptRegistration()
    {
        if (!$this->is_open) {
            return false;
        }

        if ($this->quota !== null && $this->registered_count >= $this->quota) {
            return false;
        }

        return true;
    }

    // Increment registered count
    public function incrementRegistered()
    {
        $this->increment('registered_count');
    }

    // Get remaining quota
    public function getRemainingQuotaAttribute()
    {
        if ($this->quota === null) {
            return null; // unlimited
        }
        return max(0, $this->quota - $this->registered_count);
    }
}
