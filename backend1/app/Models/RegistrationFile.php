<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RegistrationFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'registration_id', 'file_type', 'file_path', 'original_name'
    ];

    // Relasi ke registration
    public function registration()
    {
        return $this->belongsTo(Registration::class);
    }

    // Get full URL untuk file
    public function getFileUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }
}