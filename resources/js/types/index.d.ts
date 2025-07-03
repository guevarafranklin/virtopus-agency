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

export interface Work {
    id: number;
    title: string;
    description: string;
    contract_type: 'hourly' | 'monthly';
    rate: number;
    job_start_date: string;
    duration: 'short-term' | 'long-term' | 'indefinite'; // Updated to use string enum
    skills: string;
    status: 'active' | 'paused' | 'terminate';
    weekly_time_limit: number;
    user_id: number;
    user?: {
        id: number;
        name: string;
        email: string;
        role: string;
    };
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration?: number;
    status: string;
    contract_id?: number;
    is_billable: boolean;
    billable_hours?: number;
    contract?: Contract;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at: string;
    updated_at: string;
}

export interface Contract {
    id: number;
    agency_rate: number;
    work_id: number;
    user_id: number;
    work: Work;
    user: User;
    created_at: string;
    updated_at: string;
}

// Add this to your types file (usually types/index.ts)
export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}