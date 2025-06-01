import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work, Task } from '@/types';
import { formatDateTimeUS } from '@/lib/date-utils';

interface Props {
    work: Work;
    tasks: Task[];
    summary: {
        total_hours: number;
        total_cost: number;
        total_freelancer_earnings: number;
        total_agency_earnings: number;
    };
    filters: {
        filter: string;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
}

export default function Show({ work, tasks, summary, filters, dateRange }: Props) {
    return (
        <AppLayout>
            <Head title={`Timesheet - ${work.title}`} />
            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{work.title}</h1>
                        <p className="text-gray-600 mt-1">
                            {dateRange.label} Timesheet Details
                        </p>
                    </div>
                    <Link
                        href={route('client.timesheet.index', filters)}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Back to Timesheet
                    </Link>
                </div>

                {/* Project & Summary Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Project Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div><strong>Project:</strong> {work.title}</div>
                            <div><strong>Description:</strong> {work.description}</div>
                            <div><strong>Contract Type:</strong> {work.contract_type}</div>
                            <div><strong>Rate:</strong> ${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'}</div>
                            <div><strong>Weekly Limit:</strong> {work.weekly_time_limit} hours</div>
                            <div><strong>Status:</strong> {work.status}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div><strong>Total Hours:</strong> {summary.total_hours.toFixed(2)}h</div>
                            <div><strong>Total Cost:</strong> ${summary.total_cost.toFixed(2)}</div>
                            <div><strong>Freelancer Earnings:</strong> ${summary.total_freelancer_earnings.toFixed(2)}</div>
                            <div><strong>Agency Fees:</strong> ${summary.total_agency_earnings.toFixed(2)}</div>
                            
                            <div className="border-t pt-2 mt-4">
                                <div className="text-sm text-gray-600">
                                    <strong>Period:</strong> {formatDateTimeUS(dateRange.start)} - {formatDateTimeUS(dateRange.end)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tasks Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Billable Tasks ({tasks.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Freelancer</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead className="text-right">Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Cost</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => {
                                    // Fix: Add null checks for contract and work
                                    const taskCost = task.contract?.work?.rate 
                                        ? (task.billable_hours ?? 0) * task.contract.work.rate 
                                        : 0;
                                    
                                    return (
                                        <TableRow key={task.id}>
                                            <TableCell>{task.title}</TableCell>
                                            <TableCell>{task.contract?.user?.name ?? 'N/A'}</TableCell>
                                            <TableCell>{task.description || 'N/A'}</TableCell>
                                            <TableCell>{formatDateTimeUS(task.start_time)}</TableCell>
                                            <TableCell>{formatDateTimeUS(task.end_time)}</TableCell>
                                            <TableCell className="text-right">{task.billable_hours}h</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {task.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">${taskCost.toFixed(2)}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No billable tasks found for this project in the selected time period.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}