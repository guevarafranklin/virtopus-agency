import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, PaginatedData } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateUS } from '@/lib/date-utils';
import { Users, UserPlus, Info, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    users: PaginatedData<User>;
    filters: {
        search?: string;
        role?: string;
    };
}

interface AuthProps {
    user: {
        name: string;
        email: string;
        // add other user fields if needed
    };
}

export default function Index({ users, filters }: Props) {
    const { auth } = usePage<{ auth: AuthProps }>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');

    // Debounced search function
    const debouncedSearch = useDebouncedCallback((searchValue: string, role: string) => {
        router.get(route('admin.user.index'), 
            { 
                search: searchValue || undefined,
                role: role || undefined
            }, 
            { 
                preserveState: true,
                preserveScroll: true,
                replace: true
            }
        );
    }, 300);

    // Handle search input changes
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value, roleFilter);
    };

    // Handle role filter changes
    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setRoleFilter(value);
        debouncedSearch(search, value);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearch('');
        setRoleFilter('');
        router.get(route('admin.user.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Delete action
    const deleteUser = (id: number) => {
        if (confirm('Are you sure you want to delete this user?')) {
            router.delete(route('admin.user.destroy', { id }), {
                onSuccess: () => toast.success('User deleted successfully'),
                onError: () => toast.error('Failed to delete the user'),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="User Management" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">User Management</h1>
                        <p className="text-muted-foreground mt-1">Manage platform users and their permissions</p>
                    </div>
                    <Link 
                        className={buttonVariants({ variant: 'default' })} 
                        href={route('admin.user.create')}
                    >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Create User
                    </Link>
                </div>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-blue-500" />
                            User Management Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2 text-sm">
                            <p><strong>Current Admin:</strong> {auth.user.name} ({auth.user.email})</p>
                            <p><strong>Note:</strong> Your own account is not shown in this list for security reasons.</p>
                            <p><strong>Total Managed Users:</strong> {users.total}</p>
                            <p className="text-blue-600">
                                To edit your own account details, use the profile settings in your user menu.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Users
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                            <div className="w-48">
                                <select
                                    value={roleFilter}
                                    onChange={handleRoleChange}
                                    className="w-full border rounded-md p-2"
                                >
                                    <option value="">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="client">Client</option>
                                    <option value="freelancer">Freelancer</option>
                                </select>
                            </div>
                            {(search || roleFilter) && (
                                <Button variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                            {users.total} total users
                            {(search || roleFilter) && ` • ${users.data.length} matching current filters`}
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Platform Users ({users.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead className="text-right">Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.data.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                        user.role === 'admin' 
                                                            ? 'bg-red-100 text-red-800' 
                                                            : user.role === 'client'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-green-100 text-green-800'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-gray-500">
                                                    {formatDateUS(user.created_at)}
                                                </TableCell>
                                                <TableCell className="flex flex-row gap-x-2 justify-end">
                                                    <Link
                                                        href={route('admin.user.edit', { id: user.id })}
                                                        className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                                    >
                                                        Edit
                                                    </Link>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteUser(user.id)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {users.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-500">
                                            Showing {users.from} to {users.to} of {users.total} users
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!users.prev_page_url}
                                                onClick={() => router.get(users.prev_page_url!, { search, role: roleFilter }, { preserveState: true })}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            
                                            <span className="text-sm text-gray-600">
                                                Page {users.current_page} of {users.last_page}
                                            </span>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!users.next_page_url}
                                                onClick={() => router.get(users.next_page_url!, { search, role: roleFilter }, { preserveState: true })}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                {(search || roleFilter) ? (
                                    <>
                                        <p className="text-lg font-medium">No users found</p>
                                        <p className="text-sm mt-2">
                                            No users match your current filters. Try adjusting your search.
                                        </p>
                                        <div className="mt-4">
                                            <Button onClick={clearFilters} variant="outline">
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium">No other users found</p>
                                        <p className="text-sm mt-2">
                                            Create your first user to get started with user management.
                                        </p>
                                        <div className="mt-4">
                                            <Link 
                                                href={route('admin.user.create')}
                                                className={buttonVariants({ variant: 'default' })}
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Create First User
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
