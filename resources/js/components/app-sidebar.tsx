import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, FileText, Users, Briefcase, PlusCircle, Clock, DollarSign } from 'lucide-react';
import AppLogo from './app-logo';

// Role-specific navigation items
const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Contracts',
        href: '/admin/contract',
        icon: FileText,
    },
    {
        title: 'Manage Users',
        href: '/admin/user',
        icon: Users,
    },
    {
        title: 'Payroll',
        href: '/admin/payroll',
        icon: Briefcase,
    },
];

const clientNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Post Jobs',
        href: '/client/work',
        icon: PlusCircle,
    },
    {
        title: 'Timesheet & Billing',
        href: '/client/timesheet',
        icon: Clock,
    },
];

const freelancerNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Tasks',
        href: '/freelancer/task',
        icon: FileText,
    },
    {
        title: 'My Contracts',
        href: '/freelancer/contract',
        icon: Briefcase,
    },
    {
        title: 'Earnings',
        href: '/freelancer/earnings',
        icon: DollarSign,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    
    // Determine which navigation items to show based on user role
    const getNavItemsForRole = () => {
        const userRole = auth.user.role;
        switch (userRole) {
            case 'admin':
                return adminNavItems;
            case 'client':
                return clientNavItems;
            case 'freelancer':
                return freelancerNavItems;
            default:
                return [
                    {
                        title: 'Dashboard',
                        href: '/dashboard',
                        icon: LayoutGrid,
                    },
                ];
        }
    };

    const currentNavItems = getNavItemsForRole();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={currentNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
