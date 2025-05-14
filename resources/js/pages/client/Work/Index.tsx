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
                            <TableHead>Description</TableHead>
                            <TableHead>Contract Type</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead className="text-right">Budget</TableHead>
                            <TableHead className="text-right">Weekly Limit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Skills</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {works.map((work) => (
                            <TableRow key={work.id}>
                                <TableCell>{work.title}</TableCell>
                                <TableCell>{limitText(work.description)}</TableCell>
                                <TableCell>{work.contract_type}</TableCell>
                                <TableCell className="text-right">
                                    ${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </TableCell>
                                <TableCell>{new Date(work.job_start_date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">${work.budget}</TableCell>
                                <TableCell className="text-right">{work.weekly_time_limit}h</TableCell>
                                <TableCell>{work.status}</TableCell>
                                <TableCell>{Array.isArray(work.skills) ? work.skills.join(', ') : work.skills}</TableCell>
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
