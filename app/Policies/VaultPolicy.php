<?php

namespace App\Policies;

use App\Models\Vault;
use App\Models\User;

class VaultPolicy
{
    public function view(User $user, Vault $vault): bool
    {
        return $user->id === $vault->user_id;
    }

    public function update(User $user, Vault $vault): bool
    {
        return $user->id === $vault->user_id;
    }

    public function delete(User $user, Vault $vault): bool
    {
        return $user->id === $vault->user_id;
    }
}