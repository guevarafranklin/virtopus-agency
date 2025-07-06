import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Contract, PaginatedData } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDateUS } from '@/lib/date-utils';
import { Search, FileText, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useDebouncedCallback } from 'use-debounce';

interface Props {
    contracts: PaginatedData<Contract>;
    filters: {
        search?: string;
    };
}

export default function Index({ contracts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search function
    const debouncedSearch = useDebouncedCallback((value: string) => {
        router.get(route('admin.contract.index'), 
            { search: value || undefined }, 
            { 
                preserveState: true,
                preserveScroll: true,
                replace: true
            }
        );
    }, 300);

    // Handle search input changes
    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearch(value);
        debouncedSearch(value);
    }, [debouncedSearch]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearch('');
        router.get(route('admin.contract.index'), {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    }, []);

    // Delete action
    const deleteContract = useCallback((id: number) => {
        if (confirm('Are you sure you want to delete this contract?')) {
            router.delete(route('admin.contract.destroy', { id }), {
                onSuccess: () => toast.success('Contract deleted successfully'),
                onError: () => toast.error('Failed to delete the contract'),
            });
        }
    }, []);

    // Handle pagination navigation
    const handlePrevious = useCallback(() => {
        if (contracts.prev_page_url) {
            router.get(contracts.prev_page_url, { search }, { preserveState: true });
        }
    }, [contracts.prev_page_url, search]);

    const handleNext = useCallback(() => {
        if (contracts.next_page_url) {
            router.get(contracts.next_page_url, { search }, { preserveState: true });
        }
    }, [contracts.next_page_url, search]);

    return (
        <AppLayout>
            <Head title="Contract Management" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Contract Management</h1>
                        <p className="text-muted-foreground mt-1">Manage freelancer contracts and assignments</p>
                    </div>
                    <Link 
                        className={buttonVariants({ variant: 'default' })} 
                        href={route('admin.contract.create')}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Create Contract
                    </Link>
                </div>

                {/* Search and Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search Contracts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4 items-center">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <Input
                                    type="text"
                                    placeholder="Search by contract name..."
                                    value={search}
                                    onChange={handleSearchChange}
                                    className="pl-10"
                                />
                            </div>
                            {search && (
                                <Button variant="outline" onClick={clearSearch}>
                                    Clear
                                </Button>
                            )}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">
                            {contracts.total} total contracts
                            {search && ` • ${contracts.data.length} matching "${search}"`}
                        </div>
                    </CardContent>
                </Card>

                {/* Contracts Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Contracts ({contracts.total})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {contracts.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Contract Name</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Freelancer</TableHead>
                                            <TableHead className="text-right">Agency Rate</TableHead>
                                            <TableHead>Contract Type</TableHead>
                                            <TableHead className="text-right">Work Rate</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Created</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contracts.data.map((contract) => (
                                            <TableRow key={contract.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={route('admin.contract.edit', { id: contract.id })}
                                                        className="text-blue-600 hover:underline hover:text-blue-800 transition-colors duration-200"
                                                    >
                                                        {contract.work.title}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{contract.work.user?.name || 'N/A'}</TableCell>
                                                <TableCell>{contract.user?.name || 'N/A'}</TableCell>
                                                <TableCell className="text-right">{contract.agency_rate}%</TableCell>
                                                <TableCell className="capitalize">{contract.work.contract_type}</TableCell>
                                                <TableCell className="text-right">
                                                    ${contract.work.rate}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                                                        contract.work.status === 'active' 
                                                            ? 'bg-green-100 text-green-800' 
                                                            : contract.work.status === 'paused'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {contract.work.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right text-sm text-gray-500">
                                                    {formatDateUS(contract.created_at)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-row gap-x-2 justify-end">
                                                        <Link
                                                            href={route('admin.contract.edit', { id: contract.id })}
                                                            className={buttonVariants({ variant: 'outline', size: 'sm' })}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <Button
                                                            variant="destructive"
                                                            size="sm"
                                                            onClick={() => deleteContract(contract.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {contracts.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-500">
                                            Showing {contracts.from} to {contracts.to} of {contracts.total} contracts
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!contracts.prev_page_url}
                                                onClick={handlePrevious}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            
                                            <span className="text-sm text-gray-600">
                                                Page {contracts.current_page} of {contracts.last_page}
                                            </span>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={!contracts.next_page_url}
                                                onClick={handleNext}
                                            >
                                                Next
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                                {search ? (
                                    <>
                                        <p className="text-lg font-medium">No contracts found</p>
                                        <p className="text-sm mt-2">
                                            No contracts match &quot;{search}&quot;. Try adjusting your search.
                                        </p>
                                        <div className="mt-4">
                                            <Button onClick={clearSearch} variant="outline">
                                                Clear Search
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-lg font-medium">No contracts found</p>
                                        <p className="text-sm mt-2">
                                            Create your first contract to get started.
                                        </p>
                                        <div className="mt-4">
                                            <Link 
                                                href={route('admin.contract.create')}
                                                className={buttonVariants({ variant: 'default' })}
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create First Contract
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
