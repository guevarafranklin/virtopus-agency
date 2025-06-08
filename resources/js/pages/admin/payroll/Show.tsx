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
import { Contract, Task } from '@/types';
import { formatDateTimeUS } from '@/lib/date-utils';

interface Props {
    contract: Contract;
    tasks: Task[];
    summary: {
        total_hours: number;
        total_earnings: number;
        agency_earnings: number;
        freelancer_rate: number;
        agency_rate: number;
        work_rate: number;
        contract_type: string;
    };
    filters: {
        filter?: string;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
}

export default function Show({ contract, tasks, summary, filters, dateRange }: Props) {
    return (
        <AppLayout>
            <Head title={`Payroll - ${contract.work.title}`} />
            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Contract Payroll Details</h1>
                        <p className="text-gray-600 mt-1">
                            {dateRange.label} Report
                        </p>
                    </div>
                    <Link
                        href={route('admin.payroll.index', filters)}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Back to Payroll
                    </Link>
                </div>

                {/* Contract Info */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contract Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div><strong>Project:</strong> {contract.work.title}</div>
                            <div><strong>Client:</strong> {contract.work.user?.name || 'N/A'}</div>
                            <div><strong>Freelancer:</strong> {contract.user.name}</div>
                            <div><strong>Type:</strong> {contract.work.contract_type}</div>
                            <div><strong>Rate:</strong> ${contract.work.rate}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}</div>
                            <div><strong>Agency Rate:</strong> {contract.agency_rate}%</div>
                            <div><strong>Weekly Limit:</strong> {contract.work.weekly_time_limit} hours</div>
                            <div><strong>Status:</strong> {contract.work.status}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div><strong>Total Hours:</strong> {summary.total_hours.toFixed(2)}h</div>
                            <div><strong>Work Rate:</strong> ${summary.work_rate}/{summary.contract_type === 'hourly' ? 'hr' : 'month'}</div>
                            <div><strong>Agency Rate:</strong> {summary.agency_rate}%</div>
                            <div><strong>Freelancer Rate:</strong> ${summary.freelancer_rate.toFixed(2)}/{summary.contract_type === 'hourly' ? 'hr' : 'month'}</div>
                            
                            {summary.contract_type === 'monthly' && (
                                <div className="bg-blue-50 p-3 rounded-md">
                                    <p className="text-sm text-blue-800">
                                        <strong>Monthly Contract:</strong> Fixed rate applies regardless of hours worked.
                                    </p>
                                </div>
                            )}
                            
                            <div className="border-t pt-2">
                                <div><strong>Freelancer Earnings:</strong> 
                                    <span className={`text-green-600 ${summary.contract_type === 'monthly' ? 'font-semibold' : ''}`}>
                                        ${summary.total_earnings.toFixed(2)}
                                        {summary.contract_type === 'monthly' && <span className="text-xs"> (Fixed Monthly)</span>}
                                    </span>
                                </div>
                                <div><strong>Agency Earnings:</strong> 
                                    <span className={`text-blue-600 ${summary.contract_type === 'monthly' ? 'font-semibold' : ''}`}>
                                        ${summary.agency_earnings.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="border-t pt-2 mt-4">
                                <div className="text-sm text-gray-600">
                                    <strong>Period:</strong> {dateRange.start} - {dateRange.end}
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
                                    <TableHead>Description</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead className="text-right">Hours</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Earnings</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map((task) => {
                                    const taskEarnings = summary.contract_type === 'monthly' 
                                        ? 0 // Don't show individual task earnings for monthly contracts
                                        : (task.billable_hours ?? 0) * summary.freelancer_rate;
                                    return (
                                        <TableRow key={task.id}>
                                            <TableCell>{task.title}</TableCell>
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
                                            <TableCell className="text-right">
                                                {summary.contract_type === 'monthly' ? (
                                                    <span className="text-blue-600 text-xs">Fixed Rate</span>
                                                ) : (
                                                    `$${taskEarnings.toFixed(2)}`
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        {tasks.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No billable tasks found for this contract in the selected time period.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}