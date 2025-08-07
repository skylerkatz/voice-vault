<?php

namespace Database\Factories;

use App\Models\Recording;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Recording>
 */
class RecordingFactory extends Factory
{
    protected $model = Recording::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'file_path' => 'recordings/' . $this->faker->uuid() . '.wav',
            'file_name' => $this->faker->word() . '_recording.wav',
            'duration' => $this->faker->numberBetween(5, 300),
            'file_size' => $this->faker->numberBetween(10000, 5000000),
            'mime_type' => 'audio/wav',
            'transcription' => $this->faker->optional()->paragraph(),
        ];
    }

    public function withTranscription(): static
    {
        return $this->state(fn (array $attributes) => [
            'transcription' => $this->faker->paragraph(),
        ]);
    }

    public function withoutUser(): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => null,
        ]);
    }

    public function forUser(User $user): static
    {
        return $this->state(fn (array $attributes) => [
            'user_id' => $user->id,
        ]);
    }
}