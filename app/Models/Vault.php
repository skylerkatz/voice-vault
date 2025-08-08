<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Vault extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(Recording::class);
    }

    public function getFullTranscriptAttribute(): string
    {
        return $this->recordings()
            ->orderBy('created_at')
            ->get()
            ->pluck('transcription.text')
            ->filter()
            ->join("\n\n");
    }

    public function getRecordingCountAttribute(): int
    {
        return $this->recordings()->count();
    }
}