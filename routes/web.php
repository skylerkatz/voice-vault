<?php

use App\Http\Controllers\RecordingController;
use App\Http\Controllers\VaultController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('vaults.index');
    }

    return Inertia::render('welcome');
})->name('home');

Route::post('/recordings', [RecordingController::class, 'store'])->name('recordings.store');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('/recordings', [RecordingController::class, 'index'])->name('recordings.index');
    Route::delete('/recordings/{recording}', [RecordingController::class, 'destroy'])->name('recordings.destroy');

    Route::resource('vaults', VaultController::class)->except(['create', 'edit']);
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
