import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
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
import { FileText, Send, DollarSign, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { formatDateUS } from '@/lib/date-utils';

interface Client {
    id: number;
    name: string;
}

interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

interface Invoice {
    id: number;
    invoice_number: string;
    client: Client;
    billing_period_start: string;
    billing_period_end: string;
    subtotal: number;
    total: number;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
    sent_at: string | null;
    paid_at: string | null;
    due_date: string;
    invoice_items: InvoiceItem[];
}

interface PaginatedInvoices {
    data: Invoice[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface BillingPeriod {
    start: string;
    end: string;
    label: string;
}

interface Props {
    invoices: PaginatedInvoices;
    clients: Client[];
    filters: {
        client_id?: string;
        status?: string;
        date_from?: string;
        date_to?: string;
    };
}

export default function Index({ invoices, clients, filters }: Props) {
    const [clientId, setClientId] = useState(filters.client_id || '');
    const [status, setStatus] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [billingPeriod, setBillingPeriod] = useState<{current: BillingPeriod, previous: BillingPeriod} | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch billing period info
    useEffect(() => {
        fetch(route('admin.invoice.billingPeriod'))
            .then(res => res.json())
            .then(setBillingPeriod)
            .catch(console.error);
    }, []);

    const handleFilter = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        const params: Record<string, string> = {};
        if (clientId) params.client_id = clientId;
        if (status) params.status = status;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        router.get(route('admin.invoice.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [clientId, status, dateFrom, dateTo]);

    const clearFilters = useCallback(() => {
        setClientId('');
        setStatus('');
        setDateFrom('');
        setDateTo('');
        
        router.get(route('admin.invoice.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    }, []);

    const generateInvoices = useCallback(() => {
        if (confirm('Generate invoices for all clients with billable work in the previous billing period?')) {
            setLoading(true);
            router.post(route('admin.invoice.generate'), {}, {
                onFinish: () => setLoading(false),
                preserveState: true,
            });
        }
    }, []);

    const sendPendingInvoices = useCallback(() => {
        const draftCount = invoices.data.filter(inv => inv.status === 'draft').length;
        if (confirm(`Send ${draftCount} pending invoices via Stripe?`)) {
            setLoading(true);
            router.post(route('admin.invoice.sendPending'), {}, {
                onFinish: () => setLoading(false),
                preserveState: true,
            });
        }
    }, [invoices.data]);

    const sendInvoice = useCallback((invoice: Invoice) => {
        if (confirm(`Send invoice ${invoice.invoice_number} to ${invoice.client.name}?`)) {
            router.post(route('admin.invoice.send', invoice.id), {}, {
                preserveState: true,
            });
        }
    }, []);

    const getStatusBadge = (status: string) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-800',
            sent: 'bg-blue-100 text-blue-800',
            paid: 'bg-green-100 text-green-800',
            overdue: 'bg-red-100 text-red-800',
            void: 'bg-gray-100 text-gray-600',
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <AppLayout>
            <Head title="Invoice Management" />
            
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Invoice Management</h1>
                        <p className="text-muted-foreground mt-1">Manage client invoices and billing</p>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={generateInvoices} disabled={loading} variant="outline">
                            <Plus className="mr-2 h-4 w-4" />
                            Generate Invoices
                        </Button>
                        <Button onClick={sendPendingInvoices} disabled={loading}>
                            <Send className="mr-2 h-4 w-4" />
                            Send Pending
                        </Button>
                    </div>
                </div>

                {/* Billing Period Info */}
                {billingPeriod && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Billing Period Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <h4 className="font-medium text-green-700">Current Period</h4>
                                    <p className="text-sm text-gray-600">{billingPeriod.current.label}</p>
                                    <p className="text-xs text-gray-500">Active billing period</p>
                                </div>
                                <div>
                                    <h4 className="font-medium text-blue-700">Previous Period</h4>
                                    <p className="text-sm text-gray-600">{billingPeriod.previous.label}</p>
                                    <p className="text-xs text-gray-500">Ready for invoicing</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Summary Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{invoices.total}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Invoices</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {invoices.data.filter(inv => inv.status === 'draft').length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${invoices.data.reduce((sum, inv) => sum + Number(inv.total), 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
                            <DollarSign className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                ${invoices.data.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + Number(inv.total), 0).toFixed(2)}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Invoices</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 items-end">
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

                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <select
                                    id="status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="border rounded-md p-2"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="paid">Paid</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date_from">From Date</Label>
                                <Input
                                    id="date_from"
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="date_to">To Date</Label>
                                <Input
                                    id="date_to"
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" size="sm">
                                    Filter
                                </Button>
                                <Button type="button" onClick={clearFilters} variant="outline" size="sm">
                                    Clear
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Invoices Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Invoices ({invoices.total})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {invoices.data.length > 0 ? (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Invoice #</TableHead>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Billing Period</TableHead>
                                            <TableHead className="text-right">Amount</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Due Date</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invoices.data.map((invoice) => (
                                            <TableRow key={invoice.id}>
                                                <TableCell className="font-medium">
                                                    <Link
                                                        href={route('admin.invoice.show', invoice.id)}
                                                        className="text-blue-600 hover:underline"
                                                    >
                                                        {invoice.invoice_number}
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{invoice.client.name}</TableCell>
                                                <TableCell>
                                                    {formatDateUS(invoice.billing_period_start)} - {formatDateUS(invoice.billing_period_end)}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    ${invoice.total.toFixed(2)}
                                                </TableCell>
                                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                                <TableCell>{formatDateUS(invoice.due_date)}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2 justify-end">
                                                        <Link
                                                            href={route('admin.invoice.show', invoice.id)}
                                                            className="inline-flex items-center px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
                                                        >
                                                            View
                                                        </Link>
                                                        {invoice.status === 'draft' && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => sendInvoice(invoice)}
                                                                className="text-xs"
                                                            >
                                                                <Send className="mr-1 h-3 w-3" />
                                                                Send
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Pagination */}
                                {invoices.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-500">
                                            Showing {invoices.from} to {invoices.to} of {invoices.total} invoices
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={invoices.current_page === 1}
                                                onClick={() => router.get(route('admin.invoice.index'), { 
                                                    ...filters, 
                                                    page: invoices.current_page - 1 
                                                })}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Previous
                                            </Button>
                                            
                                            <span className="text-sm text-gray-600">
                                                Page {invoices.current_page} of {invoices.last_page}
                                            </span>
                                            
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={invoices.current_page === invoices.last_page}
                                                onClick={() => router.get(route('admin.invoice.index'), { 
                                                    ...filters, 
                                                    page: invoices.current_page + 1 
                                                })}
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
                                <p className="text-lg font-medium">No invoices found</p>
                                <p className="text-sm mt-2">
                                    {(clientId || status || dateFrom || dateTo) 
                                        ? 'No invoices match your current filters.'
                                        : 'Generate invoices to get started.'
                                    }
                                </p>
                                <div className="mt-4 flex gap-2 justify-center">
                                    {(clientId || status || dateFrom || dateTo) && (
                                        <Button onClick={clearFilters} variant="outline">
                                            Clear Filters
                                        </Button>
                                    )}
                                    <Button onClick={generateInvoices} disabled={loading}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Generate Invoices
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