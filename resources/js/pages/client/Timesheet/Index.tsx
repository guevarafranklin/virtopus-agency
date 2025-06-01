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
    client_rate?: number;
    freelancer_rate?: number;
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
    contracts?: WorkContractData[];
}

interface Freelancer {
    id: number;
    name: string;
    email: string;
}

interface DebugInfo {
    client_id?: number;
    all_works?: number;
    all_contracts?: number;
    all_tasks?: number;
    works_with_contracts?: number;
    processed_works?: number;
    freelancers_count?: number;
}

interface Props {
    works: WorkData[];
    freelancers: Freelancer[];
    filters: Record<string, unknown>;
    dateRange: {
        start: string;
        end: string;
        label: string;
    };
    debug?: DebugInfo;
}

export default function Index({ works, freelancers, filters, dateRange, debug }: Props) {
    // Add console logging to see what data we're getting
    console.log('Timesheet Index Props:', { works, freelancers, filters, dateRange, debug });
    
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
                
                {/* Debug Info */}
                {debug && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Debug Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div><strong>Client ID:</strong> {debug.client_id}</div>
                                <div><strong>All Works:</strong> {debug.all_works}</div>
                                <div><strong>All Contracts:</strong> {debug.all_contracts}</div>
                                <div><strong>All Tasks:</strong> {debug.all_tasks}</div>
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
                            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {works.reduce((sum, work) => sum + (work.total_hours || 0), 0).toFixed(2)}h
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {works.reduce((sum, work) => sum + (work.tasks_count || 0), 0)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {works.reduce((sum, work) => sum + (work.contracts?.length || 0), 0)}
                            </div>
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

                {/* Freelancers List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Freelancers ({freelancers.length})</CardTitle>
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
                                            {(workData.total_hours || 0).toFixed(2)}h • {workData.tasks_count || 0} tasks
                                        </p>
                                    </div>
                                    {workData.work?.id && (
                                        <Link
                                            href={route('client.timesheet.show', { 
                                                work: workData.work.id
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
                                                <TableHead className="text-right">Client Rate</TableHead>
                                                <TableHead className="text-right">Freelancer Rate</TableHead>
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
                                                        ${(contractData.client_rate || 0).toFixed(2)}/{contractData.contract_type === 'hourly' ? 'hr' : 'month'}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        ${(contractData.freelancer_rate || 0).toFixed(2)}/{contractData.contract_type === 'hourly' ? 'hr' : 'month'}
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
                            <p>No projects with contracts found.</p>
                            <p className="text-sm mt-2">Check the debug information above to see what data is available.</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
