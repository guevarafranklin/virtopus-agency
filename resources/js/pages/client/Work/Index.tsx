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
import { Work } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';

export default function Index({ works }: { works: Work[] }) {
    // Helper function to limit text to the first 10 words
    const limitText = (text: string) => {
        const words = text.split(' ');
        if (words.length > 10) {
            return words.slice(0, 10).join(' ') + '...';
        }
        return text;
    };

    // Delete action
    const deleteWork = (id: number) => {
        if (confirm('Are you sure you want to delete this work?')) {
            router.delete(route('client.work.destroy', { id }), {
                onSuccess: () => toast.success('Job deleted successfully'),
                onError: () => toast.error('Failed to delete the job'),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Jobs" />
            <div className={'mt-8'}>
                <Link className={buttonVariants({ variant: 'outline' })} href="/client/work/create">
                    Create Job
                </Link>
                <Table className={'mt-4'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[100px]">Description</TableHead>
                            <TableHead className="w-[150px] text-right">Budget</TableHead>
                            <TableHead className="w-[150px] text-right">Duration</TableHead>
                            <TableHead className="w-[150px] text-right">Status</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {works.map((work) => (
                            <TableRow key={work.id}>
                                <TableCell>{work.title}</TableCell>
                                <TableCell className="text-wrap">{limitText(work.description)}</TableCell>
                                <TableCell className="text-right">{work.budget}</TableCell>
                                <TableCell className="text-right">{work.duration}</TableCell>
                                <TableCell className="text-right">{work.status}</TableCell>
                                <TableCell className="flex flex-row gap-x-2 text-right">
                                    {/* Edit Action */}
                                    <Link
                                        href={route('client.work.edit', { id: work.id })}
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
                                    {/* Delete Action */}
                                    <Button
                                        variant={'destructive'}
                                        className={'cursor-pointer'}
                                        onClick={() => deleteWork(work.id)}
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
