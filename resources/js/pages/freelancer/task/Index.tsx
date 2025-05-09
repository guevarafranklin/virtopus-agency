import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Task } from '@/types';
import { format } from 'date-fns'; // Import date-fns for formatting

export default function Index({ tasks }: { tasks: Task[] }) {
    // Helper function to limit text to the first 10 words
    const limitText = (text: string) => {
        const words = text.split(' ');
        if (words.length > 5) {
            return words.slice(0, 5).join(' ') + '...';
        }
        return text;
    };
    const formatDateTime = (dateTime: string) => {
        return dateTime ? format(new Date(dateTime), 'MM/dd/yyyy HH:mm') : 'N/A';
    };

    return (
        <AppLayout>
            <Head title="Tasks" />
            <div className="mt-8">
            <Link className={buttonVariants({ variant: 'outline' })} href="/freelancer/task/create">
                    Create Registration
                </Link>
                <Table className="mt-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px] text-center">Title</TableHead>
                            <TableHead className="w-[200px] text-center">Description</TableHead>
                            <TableHead className="w-[150px] text-center">Start Time</TableHead>
                            <TableHead className="w-[150px] text-center">End Time</TableHead>
                            <TableHead className="w-[150px] text-center">Duration</TableHead>                            
                            <TableHead className="w-[150px] text-center">Status</TableHead>
                            <TableHead className="w-[150px] text-center">User</TableHead>
                            <TableHead className="w-[150px] text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{limitText(task.title)}</TableCell>
                                <TableCell className="text-wrap">{limitText(task.description)}</TableCell>
                                <TableCell className="text-right">{formatDateTime(task.start_time)}</TableCell>
                                <TableCell className="text-right">{formatDateTime(task.end_time)}</TableCell>
                                <TableCell>{task.duration || 'N/A'}</TableCell>
                                <TableCell>{task.status}</TableCell>
                                <TableCell>{task.user?.name || task.user?.email || 'Unknown'}</TableCell>
                                <TableCell className="flex flex-row gap-x-2 text-right">
                                    <Link
                                        href={route('freelancer.task.edit', { id: task.id })} // Ensure this route exists in your backend
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        className="cursor-pointer"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this task?')) {
                                                router.delete(route('freelancer.task.destroy', { id: task.id }), {
                                                    onSuccess: () => alert('Task deleted successfully!'),
                                                    onError: () => alert('Failed to delete the task.'),
                                                });
                                            }
                                        }}
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