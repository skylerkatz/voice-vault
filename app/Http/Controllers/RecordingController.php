<?php

namespace App\Http\Controllers;

use App\Models\Recording;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

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
        $file_name = Str::uuid7() . '.' . $file->getClientOriginalExtension();
        $file_path = $file->storeAs('recordings', $file_name, 'local');

        Recording::create([
            'user_id' => Auth::id(),
            'file_path' => $file_path,
            'file_name' => $file->getClientOriginalName() ?: $file_name,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
        ]);

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
