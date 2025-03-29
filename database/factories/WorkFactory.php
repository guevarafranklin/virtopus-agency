<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Work>
 */
class WorkFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->sentence,
            'description' => $this->faker->paragraph,
            'skills' => $this->faker->words(5),
            'budget' => $this->faker->numberBetween(100, 5000),
            'duration' => $this->faker->numberBetween(1, 12),
            'status' => $this->faker->randomElement(['open', 'in progress', 'completed']),
            'user_id' => \App\Models\User::factory(),
        ];
    }
}
