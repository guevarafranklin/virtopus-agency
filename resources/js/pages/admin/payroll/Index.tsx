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
import { Contract, User } from '@/types';
import { useState } from 'react';

interface PayrollItem {
    contract_type: string;
    contract: Contract;
    total_hours: number;
    total_earnings: number;
    agency_earnings: number;
    freelancer_rate: number;
    tasks: object[]; // Replace 'object' with a specific Task interface if available
}

interface Props {
    contracts: PayrollItem[];
    freelancers: User[];
    filters: {
        freelancer_id?: number;
        start_date?: string;
        end_date?: string;
    };
}

export default function Index({ contracts, freelancers, filters }: Props) {
    const [freelancerId, setFreelancerId] = useState(filters.freelancer_id || '');
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        
        const params = new URLSearchParams();
        if (freelancerId) params.append('freelancer_id', freelancerId.toString());
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        router.get(route('admin.payroll.index'), Object.fromEntries(params));
    };

    const clearFilters = () => {
        setFreelancerId('');
        setStartDate('');
        setEndDate('');
        router.get(route('admin.payroll.index'));
    };

    const totalAgencyEarnings = contracts.reduce((sum, item) => sum + item.agency_earnings, 0);
    const totalFreelancerEarnings = contracts.reduce((sum, item) => sum + item.total_earnings, 0);
    const totalHours = contracts.reduce((sum, item) => sum + item.total_hours, 0);

    return (
        <AppLayout>
            <Head title="Payroll Management" />
            <div className="mt-8 space-y-6">
                <h1 className="text-3xl font-bold">Payroll Management</h1>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
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
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="flex gap-4 items-end">
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
                            <Button type="submit">Filter</Button>
                            <Button type="button" variant="outline" onClick={clearFilters}>
                                Clear
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Payroll Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Contract Payroll</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Contract</TableHead>
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
                                                    start_date: startDate,
                                                    end_date: endDate
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
                        {contracts.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No billable hours found for the selected criteria.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
