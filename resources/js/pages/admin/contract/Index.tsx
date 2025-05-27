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
import { Contract } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';

export default function Index({ contracts }: { contracts: Contract[] }) {
    // Helper function to limit text to the first 10 words
    

    // Delete action
    const deleteContract = (id: number) => {
        if (confirm('Are you sure you want to delete this contract?')) {
            router.delete(route('admin.contract.destroy', { id }), {
                onSuccess: () => toast.success('Contract deleted successfully'),
                onError: () => toast.error('Failed to delete the contract'),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Contracts" />
            <div className={'mt-8'}>
                <Link className={buttonVariants({ variant: 'outline' })} href={route('admin.contract.create')}>
                    Create Contract
                </Link>
                <Table className={'mt-4'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Work Title</TableHead>
                            <TableHead>Freelancer</TableHead>
                            <TableHead className="text-right">Agency Rate (%)</TableHead>
                            <TableHead>Work Type</TableHead>
                            <TableHead className="text-right">Work Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.map((contract) => (
                            <TableRow key={contract.id}>
                                <TableCell>{contract.work.title}</TableCell>
                                <TableCell>{contract.user.name}</TableCell>
                                <TableCell className="text-right">{contract.agency_rate}%</TableCell>
                                <TableCell>{contract.work.contract_type}</TableCell>
                                <TableCell className="text-right">
                                    ${contract.work.rate}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </TableCell>
                                <TableCell>{contract.work.status}</TableCell>
                                <TableCell className="text-right">
                                    {new Date(contract.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="flex flex-row gap-x-2 justify-end">
                                    <Link
                                        href={route('admin.contract.edit', { id: contract.id })}
                                        className={buttonVariants({ variant: 'outline' })}
                                    >
                                        Edit
                                    </Link>
                                    <Button
                                        variant={'destructive'}
                                        className={'cursor-pointer'}
                                        onClick={() => deleteContract(contract.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
