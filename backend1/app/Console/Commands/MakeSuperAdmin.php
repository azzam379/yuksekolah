<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class MakeSuperAdmin extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:superadmin {email} {password} {name=Super Admin}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create or update a user with super_admin role';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $email = $this->argument('email');
        $password = $this->argument('password');
        $name = $this->argument('name');

        // Validation (Basic)
        $validator = Validator::make([
            'email' => $email,
            'password' => $password
        ], [
            'email' => 'required|email',
            'password' => 'required|min:8'
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return 1;
        }

        $user = User::where('email', $email)->first();

        if ($user) {
            if ($this->confirm("User with email {$email} already exists. Do you want to update their role to super_admin and change password?")) {
                $user->update([
                    'password' => Hash::make($password),
                    'role' => 'super_admin'
                ]);
                $this->info("User {$email} updated successfully to Super Admin.");
            }
        } else {
            User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'role' => 'super_admin',
                'email_verified_at' => now(),
            ]);
            $this->info("Super Admin {$email} created successfully.");
        }

        return 0;
    }
}
