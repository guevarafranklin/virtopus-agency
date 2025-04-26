<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Work;

class WorkSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Work::create([
            'title' => 'Web Development Project',
            'description' => 'Build a responsive website for a client.',
            'budget' => 5000,
            'duration' => 30,
            'skills' => json_encode(['HTML', 'CSS', 'JavaScript', 'Laravel']),
            'status' => 'open',
            'user_id' => 1, // Replace with a valid user ID
        ]);

        Work::create([
            'title' => 'Mobile App Development',
            'description' => 'Develop a cross-platform mobile app.',
            'budget' => 10000,
            'duration' => 60,
            'skills' => json_encode(['Flutter', 'Dart', 'Firebase']),
            'status' => 'in-progress',
            'user_id' => 1, // Replace with a valid user ID
        ]);

        Work::create([
            'title' => 'SEO Optimization',
            'description' => 'Improve the SEO ranking of a website.',
            'budget' => 2000,
            'duration' => 15,
            'skills' => json_encode(['SEO', 'Google Analytics', 'Content Writing']),
            'status' => 'closed',
            'user_id' => 1, // Replace with a valid user ID
        ]);
    }
}
