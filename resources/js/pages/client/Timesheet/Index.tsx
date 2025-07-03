import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { buttonVariants } from '@/components/ui/button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Clock, FileText, Users } from 'lucide-react';
import { useState, useEffect } from 'react';

interface WorkContractData {
    contract?: {
        id: number;
        agency_rate: string;
        work_id: number;
        user_id: number;
    };
    freelancer?: {
        id: number;
        name: string;
        email: string;
    };
    contract_type?: string;
    total_hours?: number;
    tasks_count?: number;
    rate?: number; // What client pays per hour/month
    total_cost?: number; // Total cost for this contract
}

interface WorkData {
    work?: {
        id: number;
        title?: string;
        description?: string;
        contract_type?: string;
        rate?: string;
        status?: string;
    };
    total_hours?: number;
    tasks_count?: number;
    total_cost?: number; // Total cost for all contracts in this work
    contracts?: WorkContractData[];
}

interface Freelancer {
    id: number;
    name: string;
    email: string;
}

interface DebugInfo {
    client_id: number;
    all_works: number;
    all_contracts: number;
    all_tasks: number;
    works_with_contracts: number;
    freelancers_count: number;
    processed_works: number;
    date_filter: string;
    date_range: string;
    freelancer_filter?: string;
}

interface Props {
    works: WorkData[];
    freelancers: Freelancer[];
    filters: {
        filter: string;
        freelancer_id?: string;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
    debug?: DebugInfo;
}

export default function Index({ works, freelancers, filters, dateRange, debug }: Props) {
    const [dateFilter, setDateFilter] = useState(filters.filter || 'current_week');
    const [freelancerId, setFreelancerId] = useState(filters.freelancer_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useEffect(() => {
        setDateFilter(filters.filter || 'current_week');
        setFreelancerId(filters.freelancer_id || '');
        setStartDate(filters.start_date || '');
        setEndDate(filters.end_date || '');
    }, [filters]);

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        
        const params: Record<string, string> = {
            filter: dateFilter,
        };

        if (freelancerId) {
            params.freelancer_id = freelancerId;
        }

        if (dateFilter === 'custom') {
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
        }

        router.get(route('client.timesheet.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setDateFilter('current_week');
        setFreelancerId('');
        setStartDate('');
        setEndDate('');
        
        router.get(route('client.timesheet.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Show "Show All Projects" button when no data is found
    const showAllProjects = () => {
        router.get(route('client.timesheet.index'), { filter: 'all_time' }, {
            preserveState: true,
            preserveScroll: true,
        });
    };
    
    return (
        <AppLayout>
            <Head title="Timesheet & Billing" />
            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Timesheet & Billing</h1>
                    <div className="text-sm text-gray-600">
                        {dateRange.label}: {dateRange.start} - {dateRange.end}
                    </div>
                </div>

                {/* Date Filter Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Timesheet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
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
                                <Label htmlFor="freelancer">Freelancer</Label>
                                <select
                                    id="freelancer"
                                    value={freelancerId}
                                    onChange={(e) => setFreelancerId(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Freelancers</option>
                                    {freelancers.map((freelancer) => (
                                        <option key={freelancer.id} value={freelancer.id}>
                                            {freelancer.name}
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
                
                {/* Debug Info */}
                {debug && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div><strong>Client ID:</strong> {debug.client_id}</div>
                                <div><strong>Date Filter:</strong> {debug.date_filter}</div>
                                <div><strong>Date Range:</strong> {debug.date_range}</div>
                                <div><strong>Freelancer Filter:</strong> {debug.freelancer_filter || 'None'}</div>
                                <div><strong>All Works:</strong> {debug.all_works}</div>
                                <div><strong>All Contracts:</strong> {debug.all_contracts}</div>
                                <div><strong>All Tasks (in range):</strong> {debug.all_tasks}</div>
                                <div><strong>Works with Contracts:</strong> {debug.works_with_contracts}</div>
                                <div><strong>Processed Works:</strong> {debug.processed_works}</div>
                                <div><strong>Freelancers:</strong> {debug.freelancers_count}</div>
                                <div><strong>Works Array Length:</strong> {works.length}</div>
                                <div><strong>Freelancers Array Length:</strong> {freelancers.length}</div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                ${works.reduce((sum, work) => sum + (work.total_cost || 0), 0).toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total project costs
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
                                {works.reduce((sum, work) => sum + (work.total_hours || 0), 0).toFixed(2)}h
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
                                {works.reduce((sum, work) => sum + (work.tasks_count || 0), 0)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Completed tasks
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{works.length}</div>
                            <p className="text-xs text-muted-foreground">
                                Projects with activity
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Freelancers List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Active Freelancers ({freelancers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {freelancers.length > 0 ? (
                            <ul className="space-y-2">
                                {freelancers.map((freelancer) => (
                                    <li key={freelancer.id} className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        <span>{freelancer.name} ({freelancer.email})</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No freelancers found</p>
                        )}
                    </CardContent>
                </Card>

                {/* Projects & Contracts */}
                {works.length > 0 ? (
                    works.map((workData) => (
                        <Card key={workData.work?.id || 'unknown'}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>{workData.work?.title || 'Unknown Work'}</CardTitle>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {(workData.total_hours || 0).toFixed(2)}h • {workData.tasks_count || 0} tasks • ${(workData.total_cost || 0).toFixed(2)} spent
                                        </p>
                                    </div>
                                    {workData.work?.id && (
                                        <Link
                                            href={route('client.timesheet.show', { 
                                                work: workData.work.id,
                                                filter: filters.filter,
                                                start_date: filters.start_date,
                                                end_date: filters.end_date,
                                            })}
                                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                        >
                                            View Details
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {workData.contracts && workData.contracts.length > 0 ? (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Freelancer</TableHead>
                                                <TableHead>Contract Type</TableHead>
                                                <TableHead className="text-right">Hours</TableHead>
                                                <TableHead className="text-right">Tasks</TableHead>
                                                <TableHead className="text-right">Rate</TableHead>
                                                <TableHead className="text-right">Total Cost</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {workData.contracts.map((contractData, index) => (
                                                <TableRow key={contractData.contract?.id || index}>
                                                    <TableCell>{contractData.freelancer?.name || 'Unknown'}</TableCell>
                                                    <TableCell className="capitalize">{contractData.contract_type || 'Unknown'}</TableCell>
                                                    <TableCell className="text-right">
                                                        {(contractData.total_hours || 0).toFixed(2)}h
                                                    </TableCell>
                                                    <TableCell className="text-right">{contractData.tasks_count || 0}</TableCell>
                                                    <TableCell className="text-right">
                                                        ${(contractData.rate || 0).toFixed(2)}/{contractData.contract_type === 'hourly' ? 'hr' : 'month'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <span className="text-blue-600 font-medium">
                                                            ${(contractData.total_cost || 0).toFixed(2)}
                                                            {contractData.contract_type === 'monthly' && contractData.total_hours && contractData.total_hours > 0 && (
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
                                    <p className="text-gray-500">No contracts found for this work</p>
                                )}
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="text-center py-8 text-gray-500">
                            <p>No projects with billable tasks found for the selected time period.</p>
                            <p className="text-sm mt-2 mb-4">
                                {filters.filter !== 'current_week' ? 
                                    'Try selecting a different date range or check if there are any billable tasks.' :
                                    'Your projects may not have billable tasks in the current week.'
                                }
                            </p>
                            <div className="flex gap-2 justify-center">
                                <Button onClick={showAllProjects} variant="outline">
                                    Show All Projects
                                </Button>
                                <Button onClick={clearFilters}>
                                    Reset Filters
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
