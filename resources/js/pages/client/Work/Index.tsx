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
import { formatDateUS } from '@/lib/date-utils';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Props {
    works: Work[];
    isAdmin?: boolean;
}

export default function Index({ works, isAdmin = false }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    // Format duration display
    const formatDuration = (duration: string) => {
        switch (duration) {
            case 'short-term':
                return 'Short term (0-3 months)';
            case 'long-term':
                return 'Long term (6+ months)';
            case 'indefinite':
                return 'Indefinite contract';
            default:
                return duration;
        }
    };

    // Truncate description to first 10 words
    const truncateDescription = (description: string) => {
        const words = description.trim().split(/\s+/);
        if (words.length <= 10) {
            return description;
        }
        return words.slice(0, 10).join(' ') + '...';
    };

    // Toggle row expansion
    const toggleRow = (workId: number) => {
        const newExpandedRows = new Set(expandedRows);
        if (expandedRows.has(workId)) {
            newExpandedRows.delete(workId);
        } else {
            newExpandedRows.add(workId);
        }
        setExpandedRows(newExpandedRows);
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
                            <TableHead></TableHead> {/* For expand button */}
                            <TableHead>Title</TableHead>
                            <TableHead>Contract Type</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead>Contract Length</TableHead>
                            <TableHead className="text-right">Weekly Limit</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {works.map((work) => (
                            <>
                                {/* Main Row */}
                                <TableRow key={work.id}>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleRow(work.id)}
                                            className="p-1"
                                        >
                                            {expandedRows.has(work.id) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{work.title}</TableCell>
                                    <TableCell className="capitalize">{work.contract_type}</TableCell>
                                    <TableCell className="text-right">
                                        ${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'}
                                    </TableCell>
                                    <TableCell>{formatDuration(work.duration)}</TableCell>
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
                                    <TableCell className="text-right">
                                        <div className="flex flex-row gap-x-2 justify-end">
                                            <Link
                                                href={route('client.work.edit', { id: work.id })}
                                                className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                            >
                                                Edit
                                            </Link>
                                            <Button
                                                variant={'destructive'}
                                                size="sm"
                                                className={'cursor-pointer'}
                                                onClick={() => deleteWork(work.id)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Details Row */}
                                {expandedRows.has(work.id) && (
                                    <TableRow className="bg-gray-50">
                                        <TableCell colSpan={8} className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Job Details</h4>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                                        <p className="text-sm text-gray-800 mt-1">{truncateDescription(work.description)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Job Start Date</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateUS(work.job_start_date)}</p>
                                                    </div>
                                                    {isAdmin && work.user && (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Client</label>
                                                            <p className="text-sm text-gray-800 mt-1">{work.user.name}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Skills & Requirements</h4>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Required Skills</label>
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {Array.isArray(work.skills) ? 
                                                                work.skills.map((skill, index) => (
                                                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                                                        {skill}
                                                                    </span>
                                                                )) :
                                                                <span className="text-sm text-gray-800">{work.skills}</span>
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Additional Info</h4>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateUS(work.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateUS(work.updated_at)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Work ID</label>
                                                        <p className="text-sm text-gray-800 mt-1">#{work.id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
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
