<?php

namespace App\Http\Controllers;

use App\Models\Vault;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class VaultController extends Controller
{
    public function index()
    {
        $vaults = Auth::user()->vaults()
            ->withCount('recordings')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Vaults/Index', [
            'vaults' => $vaults,
        ]);
    }

    public function show(Vault $vault)
    {
        $this->authorize('view', $vault);

        $vault->load(['recordings' => function ($query) {
            $query->orderBy('created_at');
        }]);

        return Inertia::render('Vaults/Show', [
            'vault' => $vault,
            'fullTranscript' => $vault->full_transcript,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $vault = Auth::user()->vaults()->create([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Vault created successfully.');
    }

    public function update(Request $request, Vault $vault)
    {
        $this->authorize('update', $vault);

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $vault->update([
            'name' => $request->name,
        ]);

        return redirect()->back()->with('success', 'Vault updated successfully.');
    }

    public function destroy(Vault $vault)
    {
        $this->authorize('delete', $vault);

        $vault->delete();

        return redirect()->back()->with('success', 'Vault deleted successfully.');
    }
}