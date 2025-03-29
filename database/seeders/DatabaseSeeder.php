<?php

namespace Database\Seeders;

use App\Models\Profile;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Work;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        DB::table('users')->insert([
            'name' => 'Franklin Guevara',
            'email' => 'tecguevara@gmail.com',
            'password' => bcrypt('Guevara16202'),
        ]);



        Work::factory()->count(10)->create([]);


    }
}
