import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Work, User } from '@/types';

type CreateContractForm = {
    agency_rate: number;
    work_id: number;
    user_id: number;
};

interface Props {
    works: Work[];
    users: User[];
}

export default function Create({ works, users }: Props) {
    const { data, setData, post, errors, processing } = useForm<Required<CreateContractForm>>({
        agency_rate: 15, // Default agency rate
        work_id: 0,
        user_id: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.contract.store'));
    };

    // Filter only freelancers
    const freelancers = users.filter(user => user.role === 'freelancer');

    return (
        <AppLayout>
            <Head title="Create Contract" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Create New Contract</h1>
                    <p className="text-gray-600 mt-2">
                        Assign a freelancer to an available job. Each job can only have one freelancer.
                    </p>
                </div>

                {works.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    No Available Jobs
                                </h3>
                                <div className="mt-2 text-sm text-yellow-700">
                                    <p>
                                        All active jobs already have freelancers assigned. 
                                        You need jobs without contracts to create new assignments.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="work_id">Select Available Job</Label>
                        <select
                            id="work_id"
                            name="work_id"
                            value={data.work_id}
                            onChange={(e) => setData('work_id', Number(e.target.value))}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                            disabled={works.length === 0}
                        >
                            <option value={0}>
                                {works.length === 0 ? 'No available jobs' : 'Select an available job...'}
                            </option>
                            {works.map((work) => (
                                <option key={work.id} value={work.id}>
                                    {work.title} - {work.contract_type} (${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'}) 
                                    | Client: {work.user?.name || 'Unknown'}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500">
                            Only jobs without assigned freelancers are shown
                        </p>
                        <InputError message={errors.work_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="user_id">Select Freelancer</Label>
                        <select
                            id="user_id"
                            name="user_id"
                            value={data.user_id}
                            onChange={(e) => setData('user_id', Number(e.target.value))}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                            disabled={works.length === 0}
                        >
                            <option value={0}>Select a freelancer...</option>
                            {freelancers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500">
                            Choose the freelancer to assign to this job
                        </p>
                        <InputError message={errors.user_id} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="agency_rate">Agency Rate (%)</Label>
                        <Input
                            id="agency_rate"
                            name="agency_rate"
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={data.agency_rate}
                            onChange={(e) => setData('agency_rate', Number(e.target.value))}
                            className="mt-1 block w-full"
                            placeholder="Enter agency rate percentage"
                            required
                            disabled={works.length === 0}
                        />
                        <InputError message={errors.agency_rate} />
                        <p className="text-sm text-gray-500">
                            Enter the percentage rate the agency will charge (e.g., 15 for 15%). 
                            The freelancer will receive the remaining amount.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button 
                            type="submit" 
                            disabled={processing || works.length === 0}
                        >
                            {processing ? 'Creating Contract...' : 'Create Contract'}
                        </Button>
                        {works.length === 0 && (
                            <p className="text-sm text-gray-500">
                                Contract creation disabled - no available jobs
                            </p>
                        )}
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
