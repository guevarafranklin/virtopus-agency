import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import AppLogo from '@/components/app-logo';
import AppLogoIcon from '@/components/app-logo-icon';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, LayoutGrid, FileText, Users, Briefcase, PlusCircle, Clock, DollarSign } from 'lucide-react';
import { Icon } from './icon';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

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
        icon: DollarSign,
    },
];

const activeItemStyles = 'bg-accent text-accent-foreground';

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

    const currentNavItems = getNavItemsForRole();

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
                                {/* Dashboard Link */}
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

                                {/* Role-specific Navigation Items as Individual Links */}
                                {currentNavItems.map((item) => {
                                    const isActive = page.url.startsWith(item.href);
                                    return (
                                        <NavigationMenuItem key={item.title} className="relative flex h-full items-center">
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    navigationMenuTriggerStyle(),
                                                    isActive && activeItemStyles,
                                                    'h-9 cursor-pointer px-3',
                                                )}
                                            >
                                                {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                                {item.title}
                                            </Link>
                                            {isActive && (
                                                <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                            )}
                                        </NavigationMenuItem>
                                    );
                                })}
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
                                        <AvatarFallback className="size-8 bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
                                            {getInitials(auth.user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
                <nav className="border-sidebar-border/80 border-b bg-neutral-50/50 dark:bg-neutral-900/50">
                    <div className="mx-auto flex h-12 items-center px-4 md:max-w-7xl">
                        <ol className="flex items-center space-x-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {breadcrumbs.map((item, index) => (
                                <li key={item.href} className="flex items-center">
                                    {index > 0 && <span className="mx-2">/</span>}
                                    {index === breadcrumbs.length - 1 ? (
                                        <span className="font-medium text-neutral-900 dark:text-neutral-100">{item.title}</span>
                                    ) : (
                                        <Link 
                                            href={item.href} 
                                            className="hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                                        >
                                            {item.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ol>
                    </div>
                </nav>
            )}
        </>
    );
}
