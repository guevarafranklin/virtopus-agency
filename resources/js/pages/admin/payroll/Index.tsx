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
import { Contract, User } from '@/types';
import { useState, useEffect } from 'react';

interface PayrollData {
    contract: Contract;
    total_hours: number;
    total_earnings: number;
    agency_earnings: number;
    freelancer_rate: number;
    contract_type: string;
    client: User;
}

interface Props {
    contracts: PayrollData[];
    freelancers: User[];
    clients: User[];
    filters: {
        filter?: string;
        freelancer_id?: string;
        client_id?: string;
        start_date?: string;
        end_date?: string;
    };
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
}

export default function Index({ contracts, freelancers, clients, filters, dateRange }: Props) {
    const [dateFilter, setDateFilter] = useState(filters.filter || 'current_week');
    const [freelancerId, setFreelancerId] = useState(filters.freelancer_id || '');
    const [clientId, setClientId] = useState(filters.client_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    useEffect(() => {
        setDateFilter(filters.filter || 'current_week');
        setFreelancerId(filters.freelancer_id || '');
        setClientId(filters.client_id || '');
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

        if (clientId) {
            params.client_id = clientId;
        }

        if (dateFilter === 'custom') {
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
        }

        router.get(route('admin.payroll.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setDateFilter('current_week');
        setFreelancerId('');
        setClientId('');
        setStartDate('');
        setEndDate('');
        
        router.get(route('admin.payroll.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const showAllContracts = () => {
        router.get(route('admin.payroll.index'), { filter: 'all_time' }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const totalAgencyEarnings = contracts.reduce((sum, item) => sum + item.agency_earnings, 0);
    const totalFreelancerEarnings = contracts.reduce((sum, item) => sum + item.total_earnings, 0);
    const totalHours = contracts.reduce((sum, item) => sum + item.total_hours, 0);

    return (
        <AppLayout>
            <Head title="Payroll Management" />
            <div className="mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Payroll Management</h1>
                    <div className="text-sm text-gray-600">
                        {dateRange.label}: {dateRange.start} - {dateRange.end}
                    </div>
                </div>

                {/* Date Filter Controls */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 items-end">
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
                            <div className="grid gap-2">
                                <Label htmlFor="client">Client</Label>
                                <select
                                    id="client"
                                    value={clientId}
                                    onChange={(e) => setClientId(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Clients</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name}
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
                                        <p className="text-xs text-gray-500">
                                            Displays as MM/DD/YYYY
                                        </p>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="end_date">End Date</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500">
                                            Displays as MM/DD/YYYY
                                        </p>
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
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours.toFixed(2)}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Freelancer Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalFreelancerEarnings.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Agency Earnings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${totalAgencyEarnings.toFixed(2)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{contracts.length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Payroll Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contract Payroll ({contracts.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contracts.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Contract</TableHead>
                                        <TableHead>Client</TableHead>
                                        <TableHead>Freelancer</TableHead>
                                        <TableHead>Contract Type</TableHead>
                                        <TableHead className="text-right">Total Hours</TableHead>
                                        <TableHead className="text-right">Freelancer Rate</TableHead>
                                        <TableHead className="text-right">Freelancer Earnings</TableHead>
                                        <TableHead className="text-right">Agency Rate</TableHead>
                                        <TableHead className="text-right">Agency Earnings</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contracts.map((item) => (
                                        <TableRow key={item.contract.id}>
                                            <TableCell>{item.contract.work.title}</TableCell>
                                            <TableCell>{item.client.name}</TableCell>
                                            <TableCell>{item.contract.user.name}</TableCell>
                                            <TableCell className="capitalize">{item.contract.work.contract_type}</TableCell>
                                            <TableCell className="text-right">
                                                {item.contract_type === 'monthly' ? (
                                                    <span className="text-blue-600">
                                                        Fixed: {item.total_hours.toFixed(2)}h logged
                                                    </span>
                                                ) : (
                                                    `${item.total_hours.toFixed(2)}h`
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                ${item.freelancer_rate.toFixed(2)}/{item.contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <span className={item.contract_type === 'monthly' ? 'text-blue-600 font-semibold' : ''}>
                                                    ${item.total_earnings.toFixed(2)}
                                                    {item.contract_type === 'monthly' && (
                                                        <span className="text-xs text-gray-500 block">
                                                            (Fixed Monthly)
                                                        </span>
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">{item.contract.agency_rate}%</TableCell>
                                            <TableCell className="text-right">
                                                <span className={item.contract_type === 'monthly' ? 'text-blue-600 font-semibold' : ''}>
                                                    ${item.agency_earnings.toFixed(2)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link
                                                    href={route('admin.payroll.show', { 
                                                        contract: item.contract.id,
                                                        filter: filters.filter,
                                                        start_date: filters.start_date,
                                                        end_date: filters.end_date
                                                    })}
                                                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                                >
                                                    View Details
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No contracts with billable hours found for the selected time period.</p>
                                <p className="text-sm mt-2 mb-4">
                                    {filters.filter !== 'current_week' ? 
                                        'Try selecting a different date range or check if there are any billable tasks.' :
                                        'There may not be any billable tasks in the current week.'
                                    }
                                </p>
                                <div className="flex gap-2 justify-center">
                                    <Button onClick={showAllContracts} variant="outline">
                                        Show All Contracts
                                    </Button>
                                    <Button onClick={clearFilters}>
                                        Reset Filters
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
