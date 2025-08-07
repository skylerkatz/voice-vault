# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Voice-Vault is a Laravel + React desktop application for voice transcription, built with NativePHP/Electron. It combines a Laravel 12 backend with Inertia.js and a React 19 TypeScript frontend.

## Development Commands

### Essential Commands
```bash
# Start full development environment (Laravel + Vite + Queue + Logs)
composer dev

# Desktop app development mode
composer native:dev

# Frontend development only
npm run dev

# Build for production
npm run build
npm run build:ssr  # With SSR support

# Code quality
npm run lint     # ESLint with auto-fix
npm run format   # Prettier formatting

# Testing
npm run test     # Run all tests
php artisan test # Laravel tests with Pest
```

### Laravel Commands
```bash
# Database
php artisan migrate
php artisan migrate:fresh --seed
php artisan db:seed

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Queue worker
php artisan queue:work
```

## Architecture Overview

### Tech Stack
- **Backend**: Laravel 12 (PHP 8.2+) with Inertia.js for SPA routing
- **Frontend**: React 19 with TypeScript, Vite for bundling
- **UI**: Tailwind CSS 4 + shadcn/ui components
- **Desktop**: NativePHP/Electron wrapper
- **Database**: SQLite
- **Testing**: Pest PHP (PHPUnit alternative)

### Key Architectural Decisions

1. **Inertia.js Architecture**: No traditional REST API. Pages are rendered server-side with data passed directly to React components via Inertia props.

2. **Component Structure**: 
   - Pages in `/resources/js/pages/` are Inertia page components
   - Shared components in `/resources/js/components/`
   - shadcn/ui components in `/resources/js/components/ui/`
   - Layouts define page templates (AuthLayout, AppLayout, SettingsLayout)

3. **TypeScript Types**: All Inertia page props and global types defined in `/resources/js/types/`

4. **Routing**: Server-side routes in `/routes/web.php` map to Inertia pages

### Working with Inertia.js

When creating new pages:
1. Create Laravel route in `routes/web.php`
2. Return Inertia response from controller: `Inertia::render('PageName', ['prop' => $data])`
3. Create React component in `resources/js/pages/PageName.tsx`
4. Access props with typed interface: `export default function PageName({ prop }: PageProps<{ prop: Type }>)`

### Working with shadcn/ui

Components are configured via `components.json`. When adding new shadcn components:
```bash
npx shadcn@latest add [component-name]
```

Components use the custom theme system with CSS variables defined in `resources/css/app.css`.

### Desktop App Development

NativePHP configuration in `config/nativephp.php`. Key features:
- Auto-updater configured for GitHub releases
- Window management settings
- App ID: `com.voice-vault.app`

### Testing Approach

Tests use Pest PHP framework. Test files follow naming convention:
- Feature tests: `/tests/Feature/*Test.php`
- Unit tests: `/tests/Unit/*Test.php`

Run specific test:
```bash
php artisan test --filter TestName
```

### Database Conventions

- Migrations in `/database/migrations/`
- Factories in `/database/factories/`
- SQLite database at `/database/database.sqlite`
- In-memory SQLite for testing (configured in phpunit.xml)

## Code Patterns to Follow

1. **Controllers**: Keep thin, delegate business logic to services or models
2. **Inertia Pages**: Use TypeScript interfaces for all props
3. **Components**: Follow shadcn/ui patterns for consistency
4. **Hooks**: Custom hooks in `/resources/js/hooks/` for reusable logic
5. **Layouts**: Wrap pages in appropriate layout (Auth, App, Settings)

## Coding Rules

Always follow these rules when writing code:

- Casing rules:
    - Variables are always snake_case
    - Functions are always studlyCase
    - Paths are always kebab-case
    - Classes are always CamelCase
- Comments and docblocks:
    - Only add comments when they add real value. Comments should always describe *why* not *what*
    - Only add minimal docblocks to help improve code intelligence and static analysis
- Never use `private`, `final`, or `readonly` keywords
- Avoid magic strings when an enum or a const is an option. Look in the existing codebase for an enum—it'll often be there
- Avoid variables if possible. eg. rather than calling `$response = $this->get(...)` followed by `assetsRedirect()`, just chain the calls
- Use the early return pattern where possible
- Prefer arrow functions when the line will stay under 80-100 chars
- Event sourcing:
    - Any new event-sourced code should use the Verbs package
- Testing:
    - Prefix tests with `test_` rather than using a `@test` annotation
    - Avoid tests that are largely testing that the code behaves specifically as it is written, and instead test the intention. eg. a validation message may change over time, but the invalid input should not be allowed regardless.
    - When calling eloquent factories:
        - Prefer named factory methods over `state` or passing values to `create` where possible
        - Only factory data that is relevant to the test--favor defaults otherwise
        - Eloquent factories should create necessary relationships implicitly. If you don't need a relation for the test, let the factory create it rather than creating it in the test.
- Always run PHP-CS-Fixer on your code before considering it done
- If there are "todo" comments that need to be resolved before the code gets merged, use `// FIXME`
- 
## Current Implementation Status

- ✅ Authentication system (login, register, password reset, email verification)
- ✅ User settings (profile, password, appearance)
- ✅ Dark/light mode toggle
- ✅ Responsive design with mobile navigation
- ✅ Desktop app wrapper
- ⚠️ Voice transcription features (not yet implemented)
- ⚠️ Dashboard functionality (placeholder only)
