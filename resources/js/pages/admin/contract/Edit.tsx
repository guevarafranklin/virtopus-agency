import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Contract, Work, User } from '@/types';

type EditContractForm = {
    agency_rate: number;
    work_id: number;
    user_id: number;
};

interface Props {
    contract: Contract;
    works: Work[];
    users: User[];
}

export default function Edit({ contract, works, users }: Props) {
    const { data, setData, put, errors, processing } = useForm<EditContractForm>({
        agency_rate: contract.agency_rate || 15,
        work_id: contract.work_id || 0,
        user_id: contract.user_id || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.contract.update', { id: contract.id }));
    };

    // Filter only freelancers
    const freelancers = users.filter(user => user.role === 'freelancer');

    return (
        <AppLayout>
            <Head title="Edit Contract" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold">Edit Contract</h1>
                    <p className="text-gray-600 mt-2">
                        Update contract details. You can reassign to available jobs only.
                    </p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="work_id">Select Job</Label>
                        <select
                            id="work_id"
                            name="work_id"
                            value={data.work_id}
                            onChange={(e) => setData('work_id', Number(e.target.value))}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        >
                            <option value={0}>Select a job...</option>
                            {works.map((work) => (
                                <option key={work.id} value={work.id}>
                                    {work.title} - {work.contract_type} (${work.rate}/{work.contract_type === 'hourly' ? 'hr' : 'month'})
                                    | Client: {work.user?.name || 'Unknown'}
                                    {work.id === contract.work_id && ' (Current)'}
                                </option>
                            ))}
                        </select>
                        <p className="text-sm text-gray-500">
                            Only available jobs and the current job are shown
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
                        >
                            <option value={0}>Select a freelancer...</option>
                            {freelancers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                    {user.id === contract.user_id && ' (Current)'}
                                </option>
                            ))}
                        </select>
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
                        />
                        <InputError message={errors.agency_rate} />
                        <p className="text-sm text-gray-500">
                            Enter the percentage rate the agency will charge (e.g., 15 for 15%)
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
