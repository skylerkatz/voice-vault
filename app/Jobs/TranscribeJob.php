<?php

namespace App\Jobs;

use App\Models\Recording;
use Codewithkyrian\Whisper\Whisper;
use Codewithkyrian\Whisper\WhisperFullParams;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use function Codewithkyrian\Whisper\readAudio;

class TranscribeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Recording $recording) {}

    public function handle(): void
    {
        $full_params = WhisperFullParams::default()
            ->withLanguage('en')
            ->withNThreads(8);
        $whisper = Whisper::fromPretrained(
            modelName: 'large-v3',
            baseDir: resource_path('models'),
            params: $full_params,
        );
        $audio = readAudio($this->recording->file_path);
        $segments = $whisper->transcribe($audio, 4);
        dump($segments);
        $transcript = array_map(fn ($segment) => [
            'start' => $segment->startTimestamp,
            'end' => $segment->endTimestamp,
            'text' => mb_convert_encoding($segment->text, 'UTF-8', 'UTF-8'),
        ], $segments);

        $this->recording->update([
            'transcription' => $transcript,
        ]);
    }
}
