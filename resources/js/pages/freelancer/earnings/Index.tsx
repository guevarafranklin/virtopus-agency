import AppLayout from '@/layouts/app-layout';
import { Head,  router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { DollarSign, Clock, FileText, TrendingUp } from 'lucide-react';
import { useState, useCallback } from 'react';
import { formatDateTimeUS } from '@/lib/date-utils';

interface Contract {
    id: number;
    work: {
        title: string;
        user: {
            name: string;
        };
    };
}

interface ContractEarning {
    contract: Contract;
    client_name: string;
    project_title: string;
    total_hours: number;
    task_count: number;
    freelancer_rate: number;
    earnings: number;
    contract_type: string;
}

interface Task {
    id: number;
    title: string;
    start_time: string;
    end_time: string;
    billable_hours: number;
    status: string;
    contract: {
        work: {
            title: string;
            user: {
                name: string;
            };
        };
    };
}

interface MonthlyEarning {
    month: string;
    earnings: number;
}

interface Summary {
    total_hours: number;
    total_earnings: number;
    total_tasks: number;
    avg_hourly_rate: number;
}

interface Props {
    contractEarnings: ContractEarning[];
    contracts: Contract[];
    tasks: Task[];
    summary: Summary;
    monthlyEarnings: MonthlyEarning[];
    currentYear: number;
    filters: {
        filter?: string;
        contract_id?: string;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
}

export default function Index({ 
    contractEarnings, 
    contracts, 
    tasks, 
    summary, 
    monthlyEarnings,
    currentYear,
    filters, 
    dateRange
}: Props) {
    const [dateFilter, setDateFilter] = useState(filters.filter || 'current_week');
    const [contractId, setContractId] = useState(filters.contract_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        const params: Record<string, string> = { filter: dateFilter };
        
        if (contractId) params.contract_id = contractId;
        
        if (dateFilter === 'custom') {
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
        }

        router.get(route('freelancer.earnings.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [dateFilter, contractId, startDate, endDate]);

    const clearFilters = useCallback(() => {
        setDateFilter('current_week');
        setContractId('');
        setStartDate('');
        setEndDate('');
        
        router.get(route('freelancer.earnings.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const showAllEarnings = useCallback(() => {
        router.get(route('freelancer.earnings.index'), { filter: 'all_time' }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    return (
        <AppLayout>
            <Head title="My Earnings" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Earnings</h1>
                        <p className="text-muted-foreground mt-1">
                            Track your earnings from billable tasks ({dateRange.label})
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 items-end">
                            <div className="grid gap-2">
                                <Label htmlFor="filter">Time Period</Label>
                                <select
                                    id="filter"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="current_week">Current Week</option>
                                    <option value="last_week">Last Week</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="all_time">All Time</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contract">Project</Label>
                                <select
                                    id="contract"
                                    value={contractId}
                                    onChange={(e) => setContractId(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Projects</option>
                                    {contracts.map((contract) => (
                                        <option key={contract.id} value={contract.id}>
                                            {contract.work.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {dateFilter === 'custom' && (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="start_date">Start Date</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit">Filter</Button>
                                <Button type="button" variant="outline" onClick={clearFilters}>
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${summary.total_earnings.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                My net earnings
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.total_hours.toFixed(2)}h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Billable hours worked
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {summary.total_tasks}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Completed tasks
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Hourly Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${summary.avg_hourly_rate.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per billable hour
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Contract Earnings */}
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings by Contract ({contractEarnings.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contractEarnings.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Contract Type</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Tasks</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Earnings</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contractEarnings.map((item) => (
                                        <TableRow key={item.contract.id}>
                                            <TableCell className="font-medium">{item.project_title}</TableCell>
                                            <TableCell>{item.client_name}</TableCell>
                                            <TableCell className="capitalize">{item.contract_type}</TableCell>
                                            <TableCell className="text-right">
                                                {item.contract_type === 'monthly' ? (
                                                    <span className="text-xs text-blue-600">
                                                        Fixed: {item.total_hours.toFixed(2)}h logged
                                                    </span>
                                                ) : (
                                                    `${item.total_hours.toFixed(2)}h`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{item.task_count}</TableCell>
                                            <TableCell className="text-right">
                                                ${item.freelancer_rate.toFixed(2)}/{item.contract_type === 'hourly' ? 'hr' : 'month'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className="text-green-600 font-medium">
                                                    ${item.earnings.toFixed(2)}
                                                    {item.contract_type === 'monthly' && item.total_hours > 0 && (
                                                        <span className="text-xs text-gray-500 block">
                                                            (Fixed Monthly)
                                                        </span>
                                                    )}
                                                </span>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No earnings found for the selected time period.</p>
                                <p className="text-sm mt-2 mb-4">
                                    {filters.filter !== 'current_week' ? 
                                        'Try selecting a different date range or check if there are any billable tasks.' :
                                        'You may not have completed any billable tasks this week.'
                                    }
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button onClick={showAllEarnings} variant="outline">
                                        Show All Earnings
                                    </Button>
                                    <Button onClick={clearFilters}>
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Tasks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Tasks ({tasks.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {tasks.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.map((task) => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.title}</TableCell>
                                            <TableCell>{task.contract.work.title}</TableCell>
                                            <TableCell>{task.contract.work.user.name}</TableCell>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No recent tasks found.
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Monthly Earnings Chart Data */}
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Earnings ({currentYear})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-6 gap-4">
                            {monthlyEarnings.map((month) => (
                                <div key={month.month} className="text-center">
                                    <div className="text-sm font-medium text-gray-600">{month.month}</div>
                                    <div className="text-lg font-bold text-green-600">
                                        ${month.earnings.toFixed(0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}