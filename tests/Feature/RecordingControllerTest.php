<?php

use App\Models\Recording;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

uses(RefreshDatabase::class);

beforeEach(function () {
    Storage::fake('local');
});

test('unauthenticated users can upload recordings', function () {
    $file = UploadedFile::fake()->create('recording.wav', 1000);

    $response = $this->post('/recordings', [
        'audio' => $file,
    ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Recording saved successfully');

    $this->assertDatabaseHas('recordings', [
        'user_id' => null,
    ]);

    Storage::disk('local')->assertExists(Recording::first()->file_path);
});

test('authenticated users can upload recordings', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('recording.wav', 2000);

    $response = $this->actingAs($user)
        ->post('/recordings', [
            'audio' => $file,
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Recording saved successfully');

    $this->assertDatabaseHas('recordings', [
        'user_id' => $user->id,
    ]);
});

test('upload fails without audio file', function () {
    $response = $this->post('/recordings', []);

    $response->assertSessionHasErrors(['audio']);
});

test('upload fails with invalid file type', function () {
    $file = UploadedFile::fake()->create('document.pdf', 1000, 'application/pdf');

    $response = $this->post('/recordings', [
        'audio' => $file,
    ]);

    $response->assertSessionHasErrors(['audio']);
});

test('upload fails when file exceeds size limit', function () {
    $file = UploadedFile::fake()->create('recording.wav', 105000, 'audio/wav');

    $response = $this->post('/recordings', [
        'audio' => $file,
    ]);

    $response->assertSessionHasErrors(['audio']);
});

test('authenticated users can view their recordings page', function () {
    $user = User::factory()->create();
    $other_user = User::factory()->create();

    Recording::factory()->count(3)->create(['user_id' => $user->id]);
    Recording::factory()->count(2)->create(['user_id' => $other_user->id]);

    $response = $this->actingAs($user)
        ->get('/recordings');

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Recordings/Index')
        ->has('recordings.data', 3)
        ->where('recordings.data.0.user_id', $user->id)
    );
});

test('unauthenticated users cannot view recordings page', function () {
    $response = $this->get('/recordings');

    $response->assertRedirect('/login');
});

test('authenticated users can delete their own recordings', function () {
    Storage::fake('local');
    $user = User::factory()->create();
    $file_path = 'recordings/test-file.wav';
    
    Storage::disk('local')->put($file_path, 'test content');
    
    $recording = Recording::factory()->create([
        'user_id' => $user->id,
        'file_path' => $file_path,
    ]);

    $response = $this->actingAs($user)
        ->delete("/recordings/{$recording->id}");

    $response->assertRedirect()
        ->assertSessionHas('success', 'Recording deleted successfully');

    $this->assertDatabaseMissing('recordings', [
        'id' => $recording->id,
    ]);

    Storage::disk('local')->assertMissing($file_path);
});

test('users cannot delete other users recordings', function () {
    $user = User::factory()->create();
    $other_user = User::factory()->create();
    
    $recording = Recording::factory()->create([
        'user_id' => $other_user->id,
    ]);

    $response = $this->actingAs($user)
        ->delete("/recordings/{$recording->id}");

    $response->assertStatus(403);

    $this->assertDatabaseHas('recordings', [
        'id' => $recording->id,
    ]);
});

test('unauthenticated users cannot delete recordings', function () {
    $recording = Recording::factory()->create();

    $response = $this->delete("/recordings/{$recording->id}");

    $response->assertRedirect('/login');
});

test('recordings are ordered by newest first on index page', function () {
    $user = User::factory()->create();
    
    $old_recording = Recording::factory()->create([
        'user_id' => $user->id,
        'created_at' => now()->subDays(2),
    ]);
    
    $new_recording = Recording::factory()->create([
        'user_id' => $user->id,
        'created_at' => now(),
    ]);
    
    $middle_recording = Recording::factory()->create([
        'user_id' => $user->id,
        'created_at' => now()->subDay(),
    ]);

    $response = $this->actingAs($user)
        ->get('/recordings');

    $response->assertInertia(fn (AssertableInertia $page) => $page
        ->component('Recordings/Index')
        ->where('recordings.data.0.id', $new_recording->id)
        ->where('recordings.data.1.id', $middle_recording->id)
        ->where('recordings.data.2.id', $old_recording->id)
    );
});

test('supports wav audio format', function () {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create('recording.wav', 1000);

    $response = $this->actingAs($user)
        ->post('/recordings', [
            'audio' => $file,
        ]);

    $response->assertRedirect()
        ->assertSessionHas('success', 'Recording saved successfully');
    
    $this->assertDatabaseHas('recordings', [
        'user_id' => $user->id,
    ]);
});

test('rejects non-wav audio formats', function ($extension) {
    $user = User::factory()->create();
    $file = UploadedFile::fake()->create("recording.{$extension}", 1000);

    $response = $this->actingAs($user)
        ->post('/recordings', [
            'audio' => $file,
        ]);

    $response->assertSessionHasErrors(['audio']);
})->with([
    'webm',
    'mp3',
    'ogg',
    'm4a',
]);