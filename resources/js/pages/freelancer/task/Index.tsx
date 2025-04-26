import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
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

export default function Index({ tasks }: { tasks: Task[] }) {
    // Helper function to limit text to the first 10 words
    const limitText = (text: string) => {
        const words = text.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        }
        return text;
    };

    return (
        <AppLayout>
            <Head title="Tasks" />
            <div className="mt-8">
                <h1 className="text-2xl font-bold mb-4">Tasks</h1>
                <Table className="mt-4">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[200px]">Description</TableHead>
                            <TableHead className="w-[150px] text-right">Start Time</TableHead>
                            <TableHead className="w-[150px] text-right">End Time</TableHead>
                            <TableHead className="w-[150px] text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <TableRow key={task.id}>
                                <TableCell>{task.title}</TableCell>
                                <TableCell className="text-wrap">{limitText(task.description)}</TableCell>
                                <TableCell className="text-right">{task.start_time}</TableCell>
                                <TableCell className="text-right">{task.end_time}</TableCell>
                                <TableCell className="flex flex-row gap-x-2 text-right">
                                    <Button
                                        variant="outline"
                                        className={buttonVariants({ variant: 'outline' })}
                                        onClick={() => alert(`Edit Task ${task.id}`)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="cursor-pointer"
                                        onClick={() => alert(`Delete Task ${task.id}`)}
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