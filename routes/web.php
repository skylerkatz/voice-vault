<?php

use App\Http\Controllers\RecordingController;
use App\Http\Controllers\VaultController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    $vaults = [];
    $current_vault = null;

    if (Auth::check()) {
        \App\Jobs\TranscribeJob::dispatch(\App\Models\Recording::find(3));
        $vaults = Auth::user()->vaults()
            ->orderBy('created_at', 'desc')
            ->get();
        $current_vault = $vaults->first();
    }

    return Inertia::render('welcome', [
        'vaults' => $vaults,
        'current_vault' => $current_vault,
    ]);
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
