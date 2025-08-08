Project Development Guidelines (voice-vault)

Audience: Experienced Laravel + Inertia/React developers working on this codebase.

1. Build and Configuration
- Tech stack overview
  - Backend: Laravel 12 (PHP 8.4), Pest for testing, SQLite in-memory for tests.
  - Frontend: React 19 + Vite 7 + Tailwind CSS 4, TypeScript.
  - Inertia: @inertiajs/react with SSR configured (resources/js/ssr.tsx, vite.config.ts ssr entry).
  - Routing helpers: tightenco/ziggy (aliased as 'ziggy-js' in Vite config).
  - Native desktop option: nativephp/electron (see composer native:dev script).

- Local environment prerequisites
  - PHP 8.4, Composer, Node.js 18+ (recommended for Vite 7), npm.
  - SQLite is sufficient for local development and is used by default in tests.

- Initial setup
  - Composer dependencies: composer install
  - Node dependencies: npm ci (or npm install)
  - Env file and app key:
    - cp .env.example .env
    - php artisan key:generate
  - Local SQLite DB (simple mode without MySQL):
    - touch database/database.sqlite
    - In .env set: DB_CONNECTION=sqlite and DB_DATABASE="database/database.sqlite"
    - Run migrations: php artisan migrate

- Running the app
  - Backend (HTTP): php artisan serve (defaults to http://127.0.0.1:8000)
  - Frontend assets: npm run dev (Vite dev server with hot reloading)
  - Combined developer experience (queues + logs + Vite): composer run dev
    - Runs: queue:listen, pail (log viewer), and Vite concurrently.
  - SSR mode for Inertia: composer run dev:ssr (builds SSR bundle and runs inertia SSR server)
  - Native/Electron dev: composer run native:dev (requires working Electron runtime; useful for experimenting with NativePHP)

- Vite configuration notes (vite.config.ts)
  - Laravel plugin inputs: resources/css/app.css, resources/js/app.tsx; SSR entry: resources/js/ssr.tsx
  - Alias: 'ziggy-js' -> vendor/tightenco/ziggy
  - define.global = globalThis to align with some React/Vite plugins that still reference global

2. Testing
- Test runner
  - Pest is configured (pestphp/pest + pest-plugin-laravel). PHPUnit config is phpunit.xml with two suites: Unit (tests/Unit) and Feature (tests/Feature).
  - Default Composer test script clears config cache and runs artisan test (uses Pest under the hood): composer test

- Test environment
  - phpunit.xml forces APP_ENV=testing and sets SQLite in-memory DB: DB_CONNECTION=sqlite, DB_DATABASE=:memory:
  - Queue runs sync, session/caching are array-backed; this makes tests hermetic and fast.

- Running tests
  - All tests: composer test or ./vendor/bin/pest
  - Only Unit suite (fast, does not hit HTTP kernel by default): ./vendor/bin/pest --testsuite=Unit
  - Filter by name: ./vendor/bin/pest --filter="keyword or TestName"
  - Stop on first failure: ./vendor/bin/pest --stop-on-failure

- Adding tests
  - Prefer Pest tests. Place:
    - Unit tests in tests/Unit (pure PHP or small isolated units; avoid Laravel container/DB if possible)
    - Feature tests in tests/Feature (HTTP endpoints, Inertia responses, database interactions). Use RefreshDatabase and Storage::fake where relevant.
  - Examples in repo:
    - tests/Feature/RecordingControllerTest.php exercises file uploads, authorization, ordering, and storage fakes.
    - tests/Feature/Auth/* cover auth flows (registration, password reset, email verification) using Laravel’s testing utilities.

- Demo: creating and running a simple test
  - A minimal Pest unit test can look like this:
    - File: tests/Unit/ExampleTest.php
      test('that true is true', function () {
          expect(true)->toBeTrue();
      });
  - Verified run (Unit suite only): ./vendor/bin/pest --testsuite=Unit
    - Example successful output observed during validation:
      PASS  Tests\Unit\ExampleTest
        ✓ that true is true
      PASS  Tests\Unit\GuidelinesDemoTest
        ✓ a simple arithmetic assertion passes
      Tests:    2 passed (2 assertions)
  - Note: The GuidelinesDemoTest used for verification was temporary and removed to keep the repository clean. You can add your own files under tests/Unit/ to replicate.

- Practical testing tips specific to this project
  - Storage: Use Storage::fake('local') when testing uploads (as in RecordingControllerTest) and assert file presence with Storage::disk('local')->assertExists(...).
  - DB: With in-memory SQLite, migrations run automatically when the first test touching the DB executes (via RefreshDatabase). Keep migrations idempotent.
  - Inertia responses: Use Inertia\Testing\AssertableInertia to assert component names and props.
  - File uploads: Use Illuminate\Http\UploadedFile::fake()->create('file.wav', sizeKB, 'audio/wav') and validate server-side constraints (e.g., MIME, size limits).
  - Auth scoping: Use actingAs($user) for authenticated routes; ensure authorization policies enforce per-user access for recordings.

3. Code Style and Development Conventions
- PHP
  - Use Laravel Pint for formatting: ./vendor/bin/pint
  - Follow Laravel 12 conventions: Request validation in controllers/form requests; policies for authorization; avoid business logic in controllers.
  - Use typed properties and return types (PHP 8.2+). Prefer enums/DTOs where appropriate.

- JavaScript/TypeScript
  - Linting: npm run lint (eslint + eslint-config-prettier)
  - Formatting: npm run format / npm run format:check (prettier + plugins including tailwindcss and organize-imports)
  - Types: npm run types (tsc --noEmit)
  - React: project is on React 19 with the automatic JSX runtime set in Vite (esbuild.jsx = automatic). Prefer function components and hooks.
  - Tailwind CSS v4 is enabled via @tailwindcss/vite; prefer utility-first styling and tailwind-merge for class composition.

- Frontend architecture
  - Inertia pages under resources/js/pages, shared components under resources/js/components, and layouts under resources/js/layouts.
  - SSR is available; ensure any browser-only APIs (e.g., MediaRecorder, AudioContext) are guarded behind runtime checks (typeof window !== 'undefined') or moved into effect hooks that run client-side only.
  - The audio recording feature uses Web Audio APIs (MediaRecorder, AudioContext, AnalyserNode). Ensure .wav handling remains consistent with backend validation (currently server expects/accepts WAV).

- Backend specifics
  - File uploads for recordings currently target local storage. Review max file size and MIME rules in the validation layer if requirements change.
  - Routes rendering Inertia pages should return component names matching resources/js/pages/... paths.
  - Ziggy is available for generating route URLs on the frontend; import from 'ziggy-js'.

4. Useful Commands Summary
- Install deps: composer install && npm ci
- Bootstrap app: cp .env.example .env && php artisan key:generate && touch database/database.sqlite && php artisan migrate
- Run dev servers: composer run dev (queues + logs + Vite) or php artisan serve & npm run dev
- Run SSR dev: composer run dev:ssr
- Native (Electron) dev: composer run native:dev
- Test all: composer test or ./vendor/bin/pest
- Test Unit only: ./vendor/bin/pest --testsuite=Unit
- Lint/format: npm run lint && ./vendor/bin/pint && npm run format

5. Troubleshooting
- Tests fail due to DB: Ensure SQLite extension is enabled and that the in-memory DB is supported. For local runs, use a file-backed SQLite DB and set DB_DATABASE accordingly.
- Vite build issues on Linux CI: optionalDependencies include prebuilt binaries (rollup/tailwind/lightingcss). If unavailable, allow source builds or install matching system dependencies.
- SSR hydration mismatches: Guard browser-only APIs, ensure consistent initial props between server and client, and verify that Ziggy’s route base URL matches app URL in .env.
- Large WAV uploads timing out: Consider increasing post_max_size/upload_max_filesize in PHP and max upload limits in nginx/apache. Use chunked uploads if needed.

Change Log for this Document
- 2025-08-08: Initial guidelines authored. Verified Unit test execution with Pest and removed temporary demo test file after validation.
