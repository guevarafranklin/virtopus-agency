<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Check if admin user already exists
        $existingAdmin = User::where('email', 'tecguevara@gmail.com')->first();
        
        if ($existingAdmin) {
            $this->command->info('Admin user already exists with email: tecguevara@gmail.com');
            return;
        }

        // Create the admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'tecguevara@gmail.com',
            'email_verified_at' => now(),
            'password' => Hash::make('&f?3!K#Cek3nbohL'),
            'role' => 'admin',
        ]);

        $this->command->info('Admin user created successfully:');
        $this->command->line('Email: tecguevara@gmail.com');
        $this->command->line('Password: &f?3!K#Cek3nbohL');
        $this->command->line('Role: admin');
    }
}
