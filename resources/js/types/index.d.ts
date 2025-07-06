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
    billable_hours: number;
    status: string;
    is_billable: boolean;
    created_at: string;
    updated_at: string;
    user_id: number;
    contract_id?: number;
    contract?: {
        id: number;
        work: {
            title: string;
            rate: number;
            contract_type: string;
            weekly_time_limit: number;
        };
        agency_rate: number;
    };
}

export interface Contract {
    created_at: string | Date;
    id: number;
    work: {
        title: string;
        rate: number;
        contract_type: string;
        weekly_time_limit: number;
        status: string;
        user?: {
            name: string;
        };
    };
    agency_rate: number;
    user?: {
        name: string;
    };
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