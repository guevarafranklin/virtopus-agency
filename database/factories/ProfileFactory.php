<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Profile>
 */
class ProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'first_name' => $this->faker->firstName,
            'last_name' => $this->faker->lastName,
            'title' => $this->faker->jobTitle,
            'bio' => $this->faker->paragraph,
            'skills' => $this->faker->words(5),
            'avatar' => $this->faker->imageUrl(),
            'verified' => $this->faker->boolean,
        ];
    }
}
