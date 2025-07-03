import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { DollarSign, Clock, FileText, TrendingUp, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatDateTimeUS } from '@/lib/date-utils';
import { type BreadcrumbItem, type Contract, type Task } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Earnings',
        href: '/freelancer/earnings',
    },
];

interface ContractEarning {
    contract: Contract;
    total_hours: number;
    task_count: number;
    freelancer_rate: number;
    earnings: number;
    contract_type: string;
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
    debug?: {
        all_contracts?: number;
        filtered_contracts?: number;
        contracts_count?: number;
        tasks_count?: number;
        date_filter?: string;
        date_range?: string;
        contract_filter?: string;
    };
}

const chartConfig = {
    earnings: {
        label: "Earnings",
        color: "hsl(var(--chart-3))",
    },
};

export default function Index({ 
    contractEarnings, 
    contracts, 
    tasks, 
    summary, 
    monthlyEarnings,
    currentYear,
    filters, 
    dateRange,
    debug,
 }: Props) {
    const [dateFilter, setDateFilter] = useState(filters.filter || 'current_week');
    const [contractId, setContractId] = useState(filters.contract_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useEffect(() => {
        setDateFilter(filters.filter || 'current_week');
        setContractId(filters.contract_id || '');
        setStartDate(filters.start_date || '');
        setEndDate(filters.end_date || '');
    }, [filters]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        
        const params: Record<string, string> = {
            filter: dateFilter,
        };

        if (contractId) {
            params.contract_id = contractId;
        }

        if (dateFilter === 'custom') {
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
        }

        router.get(route('freelancer.earnings.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setDateFilter('current_week');
        setContractId('');
        setStartDate('');
        setEndDate('');
        
        router.get(route('freelancer.earnings.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Earnings" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Earnings</h1>
                        <p className="text-muted-foreground mt-1">Track your income and performance</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {dateRange.label}: {dateRange.start} - {dateRange.end}
                    </div>
                </div>

                {/* Filter Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Filter Earnings
                        </CardTitle>
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
                                    <option value="current_week">This Week</option>
                                    <option value="last_week">Last Week</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="all_time">All Time</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="contract">Contract</Label>
                                <select
                                    id="contract"
                                    value={contractId}
                                    onChange={(e) => setContractId(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Contracts</option>
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

                {/* Debug Information */}
                {debug && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div><strong>Date Filter:</strong> {debug.date_filter}</div>
                                <div><strong>Date Range:</strong> {debug.date_range}</div>
                                <div><strong>Contract Filter:</strong> {debug.contract_filter || 'None'}</div>
                                <div><strong>All Contracts:</strong> {debug.all_contracts}</div>
                                <div><strong>Filtered Contracts:</strong> {debug.filtered_contracts}</div>
                                <div><strong>Contracts with Tasks:</strong> {debug.contracts_count}</div>
                                <div><strong>Recent Tasks:</strong> {debug.tasks_count}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${summary.total_earnings.toFixed(2)}</div>
                            <p className="text-xs text-muted-foreground">
                                For selected period
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_hours}h</div>
                            <p className="text-xs text-muted-foreground">
                                Billable hours worked
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_tasks}</div>
                            <p className="text-xs text-muted-foreground">
                                Billable tasks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Hourly Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${summary.avg_hourly_rate}</div>
                            <p className="text-xs text-muted-foreground">
                                Effective rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Earnings Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Monthly Earnings - {currentYear}
                        </CardTitle>
                        <CardDescription>
                            Your earnings trend throughout the year
                            {contractId && ` for ${contracts.find(c => c.id.toString() === contractId)?.work?.title}`}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                            <LineChart data={monthlyEarnings}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value: number) => `$${value}`}
                                />
                                <ChartTooltip
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Line
                                    dataKey="earnings"
                                    type="natural"
                                    stroke="var(--color-earnings)"
                                    strokeWidth={2}
                                    dot={{ fill: "var(--color-earnings)" }}
                                    activeDot={{ r: 6 }}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Contract Earnings Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Earnings by Contract</CardTitle>
                        <CardDescription>
                            Breakdown of earnings for each contract in the selected period
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {contractEarnings.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Tasks</TableHead>
                                        <TableHead className="text-right">Rate</TableHead>
                                        <TableHead className="text-right">Earnings</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contractEarnings.map((item) => (
                                        <TableRow key={item.contract.id}>
                                            <TableCell className="font-medium">
                                                <Link 
                                                    href={route('freelancer.contract.show', item.contract.id)}
                                                    className="text-blue-600 hover:underline"
                                                >
                                                    {item.contract.work.title}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{item.contract.work.user?.name}</TableCell>
                                            <TableCell className="capitalize">{item.contract_type}</TableCell>
                                            <TableCell className="text-right">
                                                {item.contract_type === 'monthly' ? (
                                                    <span className="text-blue-600">
                                                        {item.total_hours.toFixed(2)}h logged
                                                    </span>
                                                ) : (
                                                    `${item.total_hours.toFixed(2)}h`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{item.task_count}</TableCell>
                                            <TableCell className="text-right">
                                                ${item.freelancer_rate.toFixed(2)}/{item.contract_type === 'hourly' ? 'hr' : 'month'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                <span className={item.contract_type === 'monthly' ? 'text-blue-600 font-semibold' : 'text-green-600'}>
                                                    ${item.earnings.toFixed(2)}
                                                    {item.contract_type === 'monthly' && (
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
                            <div className="text-center py-8 text-muted-foreground">
                                <p>No earnings found for the selected period and filters.</p>
                                <p className="text-sm mt-2">
                                    Try adjusting your filters or check if you have completed any billable tasks.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Tasks */}
                {tasks.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Billable Tasks ({tasks.length})</CardTitle>
                            <CardDescription>
                                Tasks completed in the selected period
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Task</TableHead>
                                        <TableHead>Contract</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead className="text-right">Hours</TableHead>
                                        <TableHead className="text-right">Earnings</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {tasks.slice(0, 10).map((task) => {
                                        const contract = task.contract;
                                        const freelancerRate = contract ? 
                                            contract.work.rate * (100 - contract.agency_rate) / 100 : 0;
                                        const taskEarnings = contract?.work?.contract_type === 'monthly' ? 
                                            0 : (task.billable_hours || 0) * freelancerRate;
                                        
                                        return (
                                            <TableRow key={task.id}>
                                                <TableCell>{task.title}</TableCell>
                                                <TableCell>
                                                    {contract?.work?.title || 'N/A'}
                                                </TableCell>
                                                <TableCell>{formatDateTimeUS(task.start_time)}</TableCell>
                                                <TableCell>{formatDateTimeUS(task.end_time)}</TableCell>
                                                <TableCell className="text-right">
                                                    {(task.billable_hours || 0).toFixed(2)}h
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {contract?.work?.contract_type === 'monthly' ? (
                                                        <span className="text-blue-600 text-sm">
                                                            Fixed Rate
                                                        </span>
                                                    ) : (
                                                        <span className="text-green-600">
                                                            ${taskEarnings.toFixed(2)}
                                                        </span>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                            {tasks.length > 10 && (
                                <div className="text-center mt-4">
                                    <p className="text-sm text-muted-foreground">
                                        Showing 10 of {tasks.length} tasks
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}