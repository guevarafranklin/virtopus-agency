<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Task;
use App\Models\User;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Task>
 */
class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'start_time' => $this->faker->dateTimeBetween('-1 week', 'now'),
            'end_time' => $this->faker->dateTimeBetween('now', '+1 week'),
            'status' => $this->faker->randomElement(['pending', 'in-progress', 'completed']),
            'user_id' => User::factory(),
        ];
    }
}
