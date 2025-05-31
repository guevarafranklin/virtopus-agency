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

interface Props {
    works: Work[];
    isAdmin?: boolean;
}

export default function Index({ works, isAdmin = false }: Props) {
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
            <Head title={isAdmin ? "All Jobs" : "My Jobs"} />
            <div className={'mt-8'}>
                {!isAdmin && (
                    <Link className={buttonVariants({ variant: 'outline' })} href="/client/work/create">
                        Create Job
                    </Link>
                )}
                
                <Table className={'mt-4'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Description</TableHead>
                            {isAdmin && <TableHead>Client</TableHead>}
                            <TableHead>Contract Type</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead>Start Date</TableHead>
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
                                {isAdmin && (
                                    <TableCell>
                                        {work.user ? work.user.name : 'N/A'}
                                    </TableCell>
                                )}
                                <TableCell className="capitalize">{work.contract_type}</TableCell>
                                <TableCell className="text-right">
                                    ${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </TableCell>
                                <TableCell>{new Date(work.job_start_date).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">{work.weekly_time_limit}h</TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                        work.status === 'active' ? 'bg-green-100 text-green-800' :
                                        work.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        {work.status}
                                    </span>
                                </TableCell>
                                <TableCell>{Array.isArray(work.skills) ? work.skills.join(', ') : work.skills}</TableCell>
                                <TableCell className="flex flex-row gap-x-2 text-right">
                                    <Link
                                        href={route('client.work.edit', { id: work.id })}
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
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
                
                {works.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {isAdmin ? (
                            <p>No job posts found in the system.</p>
                        ) : (
                            <>
                                <p>You haven't created any job posts yet.</p>
                                <Link 
                                    href="/client/work/create"
                                    className={buttonVariants({ variant: 'default', className: 'mt-4' })}
                                >
                                    Create Your First Job
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
