<?php

namespace App\Providers;

use Codewithkyrian\Whisper\Whisper;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Whisper::setLogger(Log::getLogger());
    }
}
