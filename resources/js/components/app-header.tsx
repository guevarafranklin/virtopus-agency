import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Users, BookOpen, LayoutGrid, Menu, UserRoundCog, Briefcase, Clock, FileText, PlusCircle } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

// Role-specific navigation items
const adminNavItems: NavItem[] = [
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
        title: 'Tasks',
        href: '/freelancer/task',
        icon: FileText,
    },
    
    
    {
        title: 'Earnings',
        href: '/freelancer/earnings',
        icon: Briefcase,
    },
];

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    
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
                return [];
        }
    };

    const getRoleLabel = () => {
        const userRole = auth.user.role;
        switch (userRole) {
            case 'admin':
                return 'Admin';
            case 'client':
                return 'Client';
            case 'freelancer':
                return 'Freelancer';
            default:
                return 'Dashboard';
        }
    };

    const getRoleIcon = () => {
        const userRole = auth.user.role;
        switch (userRole) {
            case 'admin':
                return UserRoundCog;
            case 'client':
                return BookOpen;
            case 'freelancer':
                return Users;
            default:
                return LayoutGrid;
        }
    };

    const currentNavItems = getNavItemsForRole();
    const roleLabel = getRoleLabel();
    const RoleIcon = getRoleIcon();

    return (
        <>
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="bg-sidebar flex h-full w-64 flex-col items-stretch justify-between">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {/* Dashboard Link */}
                                            <Link href="/dashboard" className="flex items-center space-x-2 font-medium">
                                                <Icon iconNode={LayoutGrid} className="h-5 w-5" />
                                                <span>Dashboard</span>
                                            </Link>
                                            
                                            {/* Role-specific navigation items */}
                                            {currentNavItems.map((item) => (
                                                <Link key={item.title} href={item.href} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {/* Dashboard Option */}
                                <NavigationMenuItem className="relative flex h-full items-center">
                                    <Link
                                        href="/dashboard"
                                        className={cn(
                                            navigationMenuTriggerStyle(),
                                            page.url === '/dashboard' && activeItemStyles,
                                            'h-9 cursor-pointer px-3',
                                        )}
                                    >
                                        <Icon iconNode={LayoutGrid} className="mr-2 h-4 w-4" />
                                        Dashboard
                                    </Link>
                                    {page.url === '/dashboard' && (
                                        <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                    )}
                                </NavigationMenuItem>

                                {/* Role-specific Dropdown */}
                                {currentNavItems.length > 0 && (
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-9 px-3">
                                                    <Icon iconNode={RoleIcon} className="mr-2 h-4 w-4" />
                                                    {roleLabel}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-56">
                                                {currentNavItems.map((item) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.href}
                                                        className="flex items-center space-x-2 px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </NavigationMenuItem>
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-2">
                        <div className="relative flex items-center space-x-1">
                            
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="size-10 rounded-full p-1">
                                    <Avatar className="size-8 overflow-hidden rounded-full">
                                        <AvatarImage src={auth.user.avatar} alt={auth.user.name} />
                                        <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
