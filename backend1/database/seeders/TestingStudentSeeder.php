<?php

namespace Database\Seeders;

use App\Models\School;
use App\Models\User;
use App\Models\Registration;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestingStudentSeeder extends Seeder
{
    public function run(): void
    {
        // Pastikan ada sekolah aktif
        $school = School::where('status', 'active')->first();
        
        if (!$school) {
            $school = School::create([
                'name' => 'SMA Negeri 1 Testing',
                'email' => 'testing@school.com',
                'status' => 'active',
            ]);
            $school->generateRegistrationLink();
        }
        
        $students = [
            [
                'name' => 'Budi Santoso (Diterima)',
                'email' => 'student1@test.com',
                'password' => 'password123',
                'program' => 'IPA',
                'status' => 'verified',
                'notes' => 'Lulus seleksi administrasi'
            ],
            [
                'name' => 'Siti Rahayu (Menunggu)',
                'email' => 'student2@test.com', 
                'password' => 'password123',
                'program' => 'IPS',
                'status' => 'submitted',
                'notes' => 'Sedang diproses'
            ],
            [
                'name' => 'Ahmad Fauzi (Ditolak)',
                'email' => 'student3@test.com',
                'password' => 'password123',
                'program' => 'Bahasa',
                'status' => 'rejected',
                'notes' => 'Berkas tidak lengkap'
            ]
        ];
        
        foreach ($students as $data) {
            // Cek apakah user sudah ada
            $user = User::where('email', $data['email'])->first();
            
            if (!$user) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => Hash::make($data['password']),
                    'role' => 'student',
                    'school_id' => $school->id,
                ]);
                
                echo "✅ User created: {$data['email']} / password123\n";
            }
            
            // Buat atau update registration
            $registration = Registration::updateOrCreate(
                ['student_id' => $user->id],
                [
                    'school_id' => $school->id,
                    'program' => $data['program'],
                    'academic_year' => '2024/2025',
                    'status' => $data['status'],
                    'form_data' => [
                        'name' => $data['name'],
                        'email' => $data['email'],
                        'phone' => '08123456789',
                        'birth_place' => 'Jakarta',
                        'birth_date' => '2008-01-01',
                        'address' => 'Jl. Contoh No. 123',
                        'previous_school' => 'SMP Negeri 1 Jakarta',
                        'notes' => $data['notes']
                    ]
                ]
            );
            
            echo "📝 Registration: {$data['name']} - Status: {$data['status']}\n";
        }
        
        echo "\n🎯 TESTING STUDENTS READY!\n";
        echo "=========================\n";
        echo "1. student1@test.com / password123 (VERIFIED)\n";
        echo "2. student2@test.com / password123 (SUBMITTED)\n";  
        echo "3. student3@test.com / password123 (REJECTED)\n";
    }
}