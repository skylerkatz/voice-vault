<?php

namespace App\Http\Controllers;

use App\Jobs\TranscribeJob;
use App\Models\Recording;
use Codewithkyrian\Whisper\Whisper;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use function Codewithkyrian\Whisper\readAudio;

class RecordingController extends Controller
{
    public function index(): Response
    {
        $recordings = Recording::where('user_id', Auth::id())
            ->latest()
            ->paginate(20);

        return Inertia::render('Recordings/Index', [
            'recordings' => $recordings,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'audio' => 'required|file|mimes:wav|max:102400',
        ]);

        $file = $request->file('audio');
        $file_name = Str::uuid7().'.'.$file->getClientOriginalExtension();
        $file_path = $file->storeAs('recordings', $file_name, 'local');

        $recording = Recording::create([
            'user_id' => Auth::id(),
            'file_path' => storage_path('app/private/recordings/'. $file_name),
            'file_name' => $file->getClientOriginalName() ?: $file_name,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);
        TranscribeJob::dispatch($recording);
        return back()->with('success', 'Recording saved successfully');
    }

    public function destroy(Recording $recording): RedirectResponse
    {
        if ($recording->user_id !== Auth::id()) {
            abort(403, 'Unauthorized');
        }

        Storage::disk('local')->delete($recording->file_path);
        $recording->delete();

        return back()->with('success', 'Recording deleted successfully');
    }
}
