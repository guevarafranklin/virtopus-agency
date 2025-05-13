import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { User } from '@/types'; // Make sure to create this type
import { Button, buttonVariants } from '@/components/ui/button';

export default function Index({ users }: { users: User[] }) {
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
            <Head title="Users Management" />
            <div className={'mt-8'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={route('admin.user.create')}>
                    Create User
                </Link>
                <Table className={'mt-4'}>
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
                                <TableCell>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.role}</TableCell>
                                <TableCell className="text-right">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="flex flex-row gap-x-2 justify-end">
                                    <Link
                                        href={route('admin.user.edit', { id: user.id })}
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
                                    <Button
                                        variant={'destructive'}
                                        className={'cursor-pointer'}
                                        onClick={() => deleteUser(user.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
