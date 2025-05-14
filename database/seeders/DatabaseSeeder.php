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
        User::factory(2)->create();
        



        /*$this->call([
            WorkSeeder::class,
        ]);

        $this->call([
            TaskSeeder::class,
        ]); */


    }
}
