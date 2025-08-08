<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recording extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vault_id',
        'file_path',
        'file_name',
        'duration',
        'file_size',
        'mime_type',
        'transcription',
    ];

    protected $casts = [
        'duration' => 'integer',
        'file_size' => 'integer',
        'transcription' => 'json',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function vault(): BelongsTo
    {
        return $this->belongsTo(Vault::class);
    }
}
