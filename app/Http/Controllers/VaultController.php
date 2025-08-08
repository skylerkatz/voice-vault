<?php

namespace App\Http\Controllers;

use App\Models\Vault;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class VaultController extends Controller
{
    public function index()
    {
        $vaults = Auth::user()->vaults()
            ->with('recordings')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Vaults/Index', [
            'vaults' => $vaults,
        ]);
    }

    public function show(Vault $vault)
    {
        Gate::authorize('view', $vault);

        $vault->load(['recordings' => function ($query) {
            $query->orderBy('created_at');
        }]);

        $vaults = Auth::user()->vaults()
            ->with('recordings')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Vaults/Show', [
            'current_vault' => $vault,
            'vaults' => $vaults,
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

        return redirect()->route('vaults.show', $vault)
            ->with('current_vault', $vault);
    }

    public function update(Request $request, Vault $vault)
    {
        Gate::authorize('update', $vault);

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
        Gate::authorize('delete', $vault);

        $vault->delete();

        return redirect()->route('vaults.index')
            ->with('success', 'Vault deleted successfully.');
    }
}
