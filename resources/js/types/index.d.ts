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
    duration: string; // Changed from number to string
    skills: string;
    status: 'active' | 'paused' | 'terminate';
    weekly_time_limit: number;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    duration?: string;
    status: string;
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