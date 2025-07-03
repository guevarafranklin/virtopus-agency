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
import { User } from '@/types'; // Make sure to create this type
import { Button, buttonVariants } from '@/components/ui/button';
import { formatDateUS } from '@/lib/date-utils';
import { Users, UserPlus, Info } from 'lucide-react';

type AuthUser = {
    user: {
        name: string;
        email: string;
        // add other properties if needed
    };
};

type PageProps = {
    auth: AuthUser;
    // add other props if needed
};

export default function Index({ users }: { users: User[] }) {
    const { auth } = usePage<PageProps>().props;

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
                            <p><strong>Total Managed Users:</strong> {users.length}</p>
                            <p className="text-blue-600">
                                To edit your own account details, use the profile settings in your user menu.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Platform Users ({users.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="w-[150px] text-right">Created At</TableHead>
                                        <TableHead className="w-[150px] text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
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
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
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
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
