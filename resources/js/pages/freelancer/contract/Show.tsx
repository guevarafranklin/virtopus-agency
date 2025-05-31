import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Contract } from '@/types';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateUS } from '@/lib/date-utils';

interface Props {
    contract: Contract;
}

export default function Show({ contract }: Props) {
    // Calculate freelancer rate (work rate minus agency percentage)
    const calculateFreelancerRate = (workRate: number, agencyRate: number) => {
        const agencyAmount = (workRate * agencyRate) / 100;
        return workRate - agencyAmount;
    };

    const freelancerRate = calculateFreelancerRate(contract.work.rate, contract.agency_rate);

    return (
        <AppLayout>
            <Head title={`Contract - ${contract.work.title}`} />
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Contract Details</h1>
                    <Link
                        href={route('freelancer.contract.index')}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Back to Contracts
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Work Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Title</label>
                                <p className="text-lg">{contract.work.title}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Description</label>
                                <p className="text-gray-800">{contract.work.description}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Contract Type</label>
                                <p className="capitalize">{contract.work.contract_type}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Start Date</label>
                                <p>{formatDateUS(contract.work.job_start_date)}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Weekly Time Limit</label>
                                <p>{contract.work.weekly_time_limit} hours</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                    contract.work.status === 'active' ? 'bg-green-100 text-green-800' :
                                    contract.work.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {contract.work.status}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Payment Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Your Rate</label>
                                <p className="text-2xl font-bold text-green-600">
                                    ${freelancerRate.toFixed(2)}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Original Rate</label>
                                <p className="text-lg">
                                    ${contract.work.rate}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Agency Rate</label>
                                <p className="text-lg">{contract.agency_rate}%</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Agency Fee</label>
                                <p className="text-lg text-red-600">
                                    -${((contract.work.rate * contract.agency_rate) / 100).toFixed(2)}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Skills Required</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(contract.work.skills) ? 
                                contract.work.skills.map((skill, index) => (
                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        {skill}
                                    </span>
                                )) :
                                <span className="text-gray-600">{contract.work.skills}</span>
                            }
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}