<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recordings', function (Blueprint $table) {
            $table->foreignId('vault_id')->nullable()->after('user_id')->constrained('vaults')->nullOnDelete();
            $table->index('vault_id');
        });
    }

    public function down(): void
    {
        Schema::table('recordings', function (Blueprint $table) {
            $table->dropForeign(['vault_id']);
            $table->dropColumn('vault_id');
        });
    }
};
