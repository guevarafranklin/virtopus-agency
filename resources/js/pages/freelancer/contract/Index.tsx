import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Contract } from '@/types';

export default function Index({ contracts }: { contracts: Contract[] }) {
    // Calculate freelancer rate (work rate minus agency percentage)
    const calculateFreelancerRate = (workRate: number, agencyRate: number) => {
        const agencyAmount = (workRate * agencyRate) / 100;
        return workRate - agencyAmount;
    };

    

    return (
        <AppLayout>
            <Head title="My Contracts" />
            <div className={'mt-8'}>
                
                <Table className={'mt-4'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Work Title</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Contract Type</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Start Date</TableHead>
                            <TableHead className="text-right">Weekly Limit</TableHead>
                            <TableHead className="text-right">Created At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contracts.map((contract) => {
                            const freelancerRate = calculateFreelancerRate(contract.work.rate, contract.agency_rate);
                            return (
                                <TableRow key={contract.id}>
                                    <TableCell>{contract.work.title}</TableCell>
                                    <TableCell>{contract.work.description.split(' ').slice(0, 8).join(' ')}...</TableCell>
                                    <TableCell>{contract.work.contract_type}</TableCell>
                                    <TableCell className="text-right">
                                        ${freelancerRate.toFixed(2)}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs ${
                                            contract.work.status === 'active' ? 'bg-green-100 text-green-800' :
                                            contract.work.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {contract.work.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>{new Date(contract.work.job_start_date).toLocaleDateString()}</TableCell>
                                    <TableCell className="text-right">{contract.work.weekly_time_limit}h</TableCell>
                                    <TableCell className="text-right">
                                        {new Date(contract.created_at).toLocaleDateString()}
                                    </TableCell>
                                    
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
                {contracts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No contracts assigned to you yet.
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
