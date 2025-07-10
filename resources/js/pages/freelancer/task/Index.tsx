import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Eye, ChevronLeft, ChevronRight, Edit, Search } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import React from 'react';

// Define the Task type with all required properties
interface Task {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    billable_hours: number;
    status: string;
    is_billable: boolean;
    created_at: string;
    updated_at: string;
    contract?: {
        id: number;
        work: {
            title: string;
            rate: number;
            contract_type: string;
        };
        agency_rate: number;
    };
}

interface Contract {
    id: number;
    work: {
        title: string;
        rate: number;
        contract_type: string;
    };
    agency_rate: number;
}

// Define pagination types
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedTasks {
    data: Task[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: PaginationLink[];
}

interface Props {
    tasks: PaginatedTasks;
    contracts?: Contract[];
    filters?: {
        search?: string;
        status?: string;
        billable?: string;
        contract_id?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ tasks, contracts = [], filters = {} }: Props) {
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [billable, setBillable] = useState(filters.billable || '');
    const [contractId, setContractId] = useState(filters.contract_id || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    // Debounced search function
    const debouncedSearch = useDebouncedCallback((value: string) => {
        const params: Record<string, string> = {};
        if (value) params.search = value;
        if (status) params.status = status;
        if (billable) params.billable = billable;
        if (contractId) params.contract_id = contractId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('freelancer.task.index'), params, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, 300);

    const limitText = (text: string) => {
        if (!text) return '';
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

    // Fixed formatting function that preserves the original input time
    const formatTaskDateTime = (dateTimeString: string) => {
        if (!dateTimeString) return '';
        
        try {
            // Parse the ISO string and treat it as local time
            const isoDate = new Date(dateTimeString);
            
            // Check if date is valid
            if (isNaN(isoDate.getTime())) {
                return 'Invalid Date';
            }
            
            // Get the timezone offset and adjust to show the original input time
            const userTimezoneOffset = isoDate.getTimezoneOffset();
            const adjustedDate = new Date(isoDate.getTime() + (userTimezoneOffset * 60000));
            
            // Format without any timezone conversion
            return adjustedDate.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            console.error('Error formatting task date:', error);
            return dateTimeString;
        }
    };

    // Helper function to safely get pagination link
    const getPaginationLink = (label: string): string => {
        const link = tasks.links.find(link => link.label === label);
        return link?.url || '#';
    };

    // Helper function to check if link is disabled
    const isLinkDisabled = (label: string): boolean => {
        if (label === '&laquo; Previous') return tasks.current_page === 1;
        if (label === 'Next &raquo;') return tasks.current_page === tasks.last_page;
        return false;
    };

    // Handle search input changes
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Handle filter changes
    const handleFilterChange = useCallback(() => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (status) params.status = status;
        if (billable) params.billable = billable;
        if (contractId) params.contract_id = contractId;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('freelancer.task.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [search, status, billable, contractId, dateFrom, dateTo]);

    // Clear filters
    const clearFilters = useCallback(() => {
        setSearch('');
        setStatus('');
        setBillable('');
        setContractId('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('freelancer.task.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    return (
        <AppLayout>
            <Head title="Tasks" />
            <div className="mt-8 space-y-6">
                {/* Header with Create Button and Task Count */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Showing {tasks.from || 0} to {tasks.to || 0} of {tasks.total} tasks
                        </p>
                    </div>
                    <Link className={buttonVariants({ variant: 'outline' })} href="/freelancer/task/create">
                        Create Task
                    </Link>
                </div>

                {/* Filters Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter Tasks
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            {/* Search */}
                            <div className="grid gap-2">
                                <Label htmlFor="search">Search Tasks</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by title or description..."
                                    value={search}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="pending">Pending</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>

                            {/* Billable Filter */}
                            <div className="grid gap-2">
                                <Label htmlFor="billable">Billing</Label>
                                <select
                                    id="billable"
                                    value={billable}
                                    onChange={(e) => setBillable(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Tasks</option>
                                    <option value="true">Billable Only</option>
                                    <option value="false">Non-billable Only</option>
                                </select>
                            </div>

                            {/* Contract Filter */}
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

                            {/* Date From */}
                            <div className="grid gap-2">
                                <Label htmlFor="date_from">Date From</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            {/* Date To */}
                            <div className="grid gap-2">
                                <Label htmlFor="date_to">Date To</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            {/* Filter Actions */}
                            <div className="grid gap-2">
                                <Label>&nbsp;</Label>
                                <div className="flex gap-2">
                                    <Button onClick={handleFilterChange} size="sm">
                                        Apply
                                    </Button>
                                    <Button onClick={clearFilters} variant="outline" size="sm">
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tasks Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
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
                                {tasks.data.map((task) => (
                                    <React.Fragment key={task.id}>
                                        {/* Main Row */}
                                        <TableRow>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => toggleRow(task.id)}
                                                    className="p-1"
                                                    aria-label={`Toggle details for ${task.title}`}
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
                                                        aria-label={`View details for ${task.title}`}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                        View Details
                                                    </Button>
                                                    <Link
                                                        href={route('freelancer.task.edit', task.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                                                        aria-label={`Edit task ${task.title}`}
                                                    >
                                                        <Edit className="h-3 w-3" />
                                                        Edit
                                                    </Link>
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
                                                                <p className="text-sm text-gray-800 mt-1">{formatTaskDateTime(task.start_time)}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">End Time</label>
                                                                <p className="text-sm text-gray-800 mt-1">{formatTaskDateTime(task.end_time)}</p>
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
                                                                        <label className="text-sm font-medium text-gray-600">My Hourly Rate</label>
                                                                        <p className="text-sm text-green-600 font-medium mt-1">
                                                                            ${((task.contract.work.rate * (100 - task.contract.agency_rate)) / 100).toFixed(2)}/hr
                                                                        </p>
                                                                        {task.contract.work.contract_type === 'monthly' && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                Fixed monthly rate contract
                                                                            </p>
                                                                        )}
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
                                                                <p className="text-sm text-gray-800 mt-1">{formatTaskDateTime(task.created_at)}</p>
                                                            </div>
                                                            <div>
                                                                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                                                <p className="text-sm text-gray-800 mt-1">{formatTaskDateTime(task.updated_at)}</p>
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

                                                    {/* Edit Action in Expanded Row */}
                                                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <p className="text-sm text-blue-800">
                                                                    <strong>Need to make changes?</strong> You can now edit your time inputs and task status.
                                                                </p>
                                                            </div>
                                                            <Link
                                                                href={route('freelancer.task.edit', task.id)}
                                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                Edit Task
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination Component */}
                {tasks.last_page > 1 && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 border rounded-lg">
                        <div className="flex flex-1 justify-between sm:hidden">
                            {/* Mobile pagination */}
                            <Link
                                href={getPaginationLink('&laquo; Previous')}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                    isLinkDisabled('&laquo; Previous')
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                                preserveState
                                aria-disabled={isLinkDisabled('&laquo; Previous')}
                            >
                                Previous
                            </Link>
                            <Link
                                href={getPaginationLink('Next &raquo;')}
                                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                                    isLinkDisabled('Next &raquo;')
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                                preserveState
                                aria-disabled={isLinkDisabled('Next &raquo;')}
                            >
                                Next
                            </Link>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{tasks.from}</span> to{' '}
                                    <span className="font-medium">{tasks.to}</span> of{' '}
                                    <span className="font-medium">{tasks.total}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    {/* Previous button */}
                                    <Link
                                        href={getPaginationLink('&laquo; Previous')}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                            isLinkDisabled('&laquo; Previous') ? 'cursor-not-allowed' : ''
                                        }`}
                                        preserveState
                                        aria-disabled={isLinkDisabled('&laquo; Previous')}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                    </Link>

                                    {/* Page numbers */}
                                    {tasks.links.slice(1, -1).map((link, index) => (
                                        <Link
                                            key={`page-${index}`}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                link.active
                                                    ? 'z-10 bg-blue-600 text-white focus:z-20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                                                    : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                            }`}
                                            preserveState
                                            aria-current={link.active ? 'page' : undefined}
                                        >
                                            {link.label}
                                        </Link>
                                    ))}

                                    {/* Next button */}
                                    <Link
                                        href={getPaginationLink('Next &raquo;')}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                            isLinkDisabled('Next &raquo;') ? 'cursor-not-allowed' : ''
                                        }`}
                                        preserveState
                                        aria-disabled={isLinkDisabled('Next &raquo;')}
                                    >
                                        <span className="sr-only">Next</span>
                                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                    </Link>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {tasks.data.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Eye className="h-12 w-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                        <p className="text-gray-500 mb-6">
                            {search || status || billable || contractId || dateFrom || dateTo
                                ? 'No tasks match your current filters. Try adjusting your search criteria.'
                                : "You haven't created any tasks yet. Get started by creating your first task."
                            }
                        </p>
                        <div className="flex gap-2 justify-center">
                            {(search || status || billable || contractId || dateFrom || dateTo) && (
                                <Button onClick={clearFilters} variant="outline">
                                    Clear Filters
                                </Button>
                            )}
                            <Link 
                                href="/freelancer/task/create"
                                className={buttonVariants({ variant: 'default' })}
                            >
                                Create Your First Task
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}