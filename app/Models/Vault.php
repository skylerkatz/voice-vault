<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
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

    protected $appends = ['recording_count', 'full_transcript'];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function recordings(): HasMany
    {
        return $this->hasMany(Recording::class);
    }

    protected function fullTranscript(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->recordings()
                ->orderBy('created_at')
                ->get()
//                ->dd()
                ->filter()
                ->join("\n\n")
        );
    }

    protected function recordingCount(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->recordings()->count()
        );
    }
}
