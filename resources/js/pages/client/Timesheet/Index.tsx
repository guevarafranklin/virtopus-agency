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
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Work, User, Contract } from '@/types';
import { formatDateUS } from '@/lib/date-utils';
import { useState } from 'react';

interface ContractData {
    contract: Contract;
    freelancer: User;
    total_hours: number;
    freelancer_earnings: number;
    agency_earnings: number;
    total_cost: number;
    freelancer_rate: number;
    client_rate: number;
    contract_type: string;
    tasks_count: number;
}

interface WorkData {
    work: Work;
    contracts: ContractData[];
    total_cost: number;
    total_hours: number;
}

interface Props {
    works: WorkData[];
    freelancers: User[];
    filters: {
        filter: string;
        freelancer_id?: number;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
}

export default function Index({ works, freelancers, filters, dateRange }: Props) {
    const [selectedFilter, setSelectedFilter] = useState(filters.filter);
    const [freelancerId, setFreelancerId] = useState(filters.freelancer_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        
        const params = new URLSearchParams();
        params.append('filter', selectedFilter);
        if (freelancerId) params.append('freelancer_id', freelancerId.toString());
        if (selectedFilter === 'custom') {
            if (startDate) params.append('start_date', startDate);
            if (endDate) params.append('end_date', endDate);
        }

        router.get(route('client.timesheet.index'), Object.fromEntries(params));
    };

    const clearFilters = () => {
        setSelectedFilter('current_week');
        setFreelancerId('');
        setStartDate('');
        setEndDate('');
        router.get(route('client.timesheet.index'));
    };

    // Calculate totals
    const totalCost = works.reduce((sum, work) => sum + work.total_cost, 0);
    const totalHours = works.reduce((sum, work) => sum + work.total_hours, 0);
    const totalContracts = works.reduce((sum, work) => sum + work.contracts.length, 0);

    return (
        <AppLayout>
            <Head title="Timesheet & Billing" />
            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Timesheet & Billing</h1>
                    <div className="text-sm text-gray-600">
                        {dateRange.label}: {formatDateUS(dateRange.start)} - {formatDateUS(dateRange.end)}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours.toFixed(2)}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalContracts}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{works.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex gap-4 items-end flex-wrap">
                            <div className="grid gap-2">
                                <Label htmlFor="filter">Time Period</Label>
                                <select
                                    id="filter"
                                    value={selectedFilter}
                                    onChange={(e) => setSelectedFilter(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="current_week">Current Week</option>
                                    <option value="last_week">Last Week</option>
                                    <option value="last_month">Last Month</option>
                                    <option value="last_3_months">Last 3 Months</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            
                            {selectedFilter === 'custom' && (
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
                            
                            <Button type="submit">Apply Filters</Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Projects & Contracts */}
                {works.map((workData) => (
                    <Card key={workData.work.id}>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>{workData.work.title}</CardTitle>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {workData.total_hours.toFixed(2)}h • ${workData.total_cost.toFixed(2)} total cost
                                    </p>
                                </div>
                                <Link
                                    href={route('client.timesheet.show', { 
                                        work: workData.work.id,
                                        filter: selectedFilter,
                                        start_date: startDate,
                                        end_date: endDate
                                    })}
                                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                >
                                    View Details
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
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
                                    {workData.contracts.map((contractData) => (
                                        <TableRow key={contractData.contract.id}>
                                            <TableCell>{contractData.freelancer.name}</TableCell>
                                            <TableCell className="capitalize">{contractData.contract_type}</TableCell>
                                            <TableCell className="text-right">
                                                {contractData.contract_type === 'monthly' ? (
                                                    <span className="text-blue-600">
                                                        {contractData.total_hours.toFixed(2)}h logged
                                                    </span>
                                                ) : (
                                                    `${contractData.total_hours.toFixed(2)}h`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">{contractData.tasks_count}</TableCell>
                                            <TableCell className="text-right">
                                                ${contractData.client_rate.toFixed(2)}/{contractData.contract_type === 'hourly' ? 'hr' : 'month'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={contractData.contract_type === 'monthly' ? 'text-blue-600 font-semibold' : ''}>
                                                    ${contractData.total_cost.toFixed(2)}
                                                    {contractData.contract_type === 'monthly' && (
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
                        </CardContent>
                    </Card>
                ))}

                {works.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8 text-gray-500">
                            <p>No billable hours found for the selected time period.</p>
                            <p className="text-sm mt-2">Try selecting a different date range or check if freelancers have logged any billable tasks.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
