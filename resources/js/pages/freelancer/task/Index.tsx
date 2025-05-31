import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
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
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useState } from 'react';

export default function Index({ tasks }: { tasks: Task[] }) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

    const limitText = (text: string) => {
        const words = text.split(' ');
        if (words.length > 5) {
            return words.slice(0, 5).join(' ') + '...';
        }
        return text;
    };

    // Toggle row expansion
    const toggleRow = (taskId: number) => {
        const newExpandedRows = new Set(expandedRows);
        if (expandedRows.has(taskId)) {
            newExpandedRows.delete(taskId);
        } else {
            newExpandedRows.add(taskId);
        }
        setExpandedRows(newExpandedRows);
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
                            <TableHead></TableHead> {/* For expand button */}
                            <TableHead>Task</TableHead>
                            <TableHead>Contract</TableHead>
                            <TableHead>Billable</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tasks.map((task) => (
                            <>
                                {/* Main Row */}
                                <TableRow key={task.id}>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleRow(task.id)}
                                            className="p-1"
                                        >
                                            {expandedRows.has(task.id) ? (
                                                <ChevronUp className="h-4 w-4" />
                                            ) : (
                                                <ChevronDown className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </TableCell>
                                    <TableCell className="font-medium">{limitText(task.title)}</TableCell>
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
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                            'bg-gray-100 text-gray-800'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-row gap-x-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleRow(task.id)}
                                                className="flex items-center gap-1"
                                            >
                                                <Eye className="h-3 w-3" />
                                                View Details
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>

                                {/* Expanded Details Row */}
                                {expandedRows.has(task.id) && (
                                    <TableRow className="bg-gray-50">
                                        <TableCell colSpan={7} className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Task Details</h4>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Full Task Name</label>
                                                        <p className="text-sm text-gray-800 mt-1">{task.title}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Description</label>
                                                        <p className="text-sm text-gray-800 mt-1">{task.description || 'No description provided'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Start Time</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateTimeUS(task.start_time)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">End Time</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateTimeUS(task.end_time)}</p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Contract & Billing</h4>
                                                    {task.contract ? (
                                                        <>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Contract</label>
                                                                <p className="text-sm text-gray-800 mt-1">{task.contract.work.title}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Client Rate</label>
                                                                <p className="text-sm text-gray-800 mt-1">
                                                                    ${task.contract.work.rate}/{task.contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                                                </p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Your Rate</label>
                                                                <p className="text-sm text-gray-800 mt-1">
                                                                    ${((task.contract.work.rate * (100 - task.contract.agency_rate)) / 100).toFixed(2)}/{task.contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                                                </p>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div>
                                                            <label className="text-sm font-medium text-gray-600">Contract</label>
                                                            <p className="text-sm text-gray-400 mt-1">No contract assigned</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Billable Hours</label>
                                                        <p className="text-sm text-gray-800 mt-1">{task.billable_hours || 0}h</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Billing Status</label>
                                                        <p className={`text-sm mt-1 ${
                                                            task.is_billable ? 'text-green-600 font-medium' : 'text-gray-600'
                                                        }`}>
                                                            {task.is_billable ? 'Billable' : 'Non-billable'}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h4 className="font-semibold text-gray-900 border-b pb-2">Additional Info</h4>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateTimeUS(task.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                        <p className="text-sm text-gray-800 mt-1">{formatDateTimeUS(task.updated_at)}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Task ID</label>
                                                        <p className="text-sm text-gray-800 mt-1">#{task.id}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Current Status</label>
                                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs ${
                                                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                            {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Read-only notice */}
                                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Note:</strong> Tasks are read-only once created. Contact your administrator if you need to make changes to this task.
                                                </p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </>
                        ))}
                    </TableBody>
                </Table>

                {tasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>You haven't created any tasks yet.</p>
                        <Link 
                            href="/freelancer/task/create"
                            className={buttonVariants({ variant: 'default', className: 'mt-4' })}
                        >
                            Create Your First Task
                        </Link>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}