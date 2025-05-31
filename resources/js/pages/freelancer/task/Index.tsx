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
import { formatDateTimeUS } from '@/lib/date-utils';

export default function Index({ tasks }: { tasks: Task[] }) {
    const limitText = (text: string) => {
        const words = text.split(' ');
        if (words.length > 5) {
            return words.slice(0, 5).join(' ') + '...';
        }
        return text;
    };

    return (
        <AppLayout>
            <Head title="Tasks" />
            <div className="mt-8">
                <Link className={buttonVariants({ variant: 'outline' })} href="/freelancer/task/create">
                    Create Task
                </Link>
                <Table className="mt-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead>Billable</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Start Time</TableHead>
                            <TableHead>End Time</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{limitText(task.title)}</TableCell>
                                <TableCell>{limitText(task.description)}</TableCell>
                                <TableCell>
                                    {task.contract ? (
                                        <span className="text-sm">
                                            {task.contract.work.title}
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">No Contract</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.is_billable ? (
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                            Billable
                                        </span>
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                                            Non-billable
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {task.billable_hours ? `${task.billable_hours}h` : 'N/A'}
                                </TableCell>
                                <TableCell>{formatDateTimeUS(task.start_time)}</TableCell>
                                <TableCell>{formatDateTimeUS(task.end_time)}</TableCell>
                                <TableCell>{task.status}</TableCell>
                                <TableCell className="flex flex-row gap-x-2">
                                    <Link
                                        href={route('freelancer.task.edit', { id: task.id })}
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            if (confirm('Are you sure you want to delete this task?')) {
                                                router.delete(route('freelancer.task.destroy', { id: task.id }));
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