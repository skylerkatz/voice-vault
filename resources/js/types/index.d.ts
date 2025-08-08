import { LucideIcon } from 'lucide-react';
import type { Config } from 'ziggy-js';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    href: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    ziggy: Config & { location: string };
    sidebarOpen: boolean;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Vault {
    id: number;
    user_id: number;
    name: string;
    created_at: string;
    updated_at: string;
    recordings?: Recording[];
    recording_count?: number;
    full_transcript?: string;
}

export interface Recording {
    id: number;
    user_id: number;
    vault_id?: number | null;
    file_path: string;
    file_name: string;
    duration: number;
    file_size: number;
    mime_type: string;
    transcription: {
        text?: string;
        [key: string]: unknown;
    } | null;
    created_at: string;
    updated_at: string;
    vault?: Vault;
}
