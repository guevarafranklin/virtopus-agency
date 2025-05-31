import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toISODate, getMinDateForWork } from '@/lib/date-utils';

interface EditWorkForm {
    id: number;
    title: string;
    description: string;
    contract_type: 'hourly' | 'monthly';
    rate: number;
    job_start_date: string;
    duration: 'short-term' | 'long-term' | 'indefinite';
    skills: string;
    status: 'active' | 'paused' | 'terminate';
    weekly_time_limit: number;
}

export default function Edit({ work }: { work: EditWorkForm }) {
    if (!work) {
        return (
            <AppLayout>
                <Head title="Edit Work" />
                <div className="p-4">Work not found.</div>
            </AppLayout>
        );
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data, setData, put, errors, processing } = useForm<Required<EditWorkForm>>({
        id: work.id,
        title: work.title || '',
        description: work.description || '',
        contract_type: work.contract_type || 'hourly',
        rate: work.rate || 0,
        job_start_date: work.job_start_date ? toISODate(work.job_start_date) : '',
        duration: work.duration || 'short-term',
        skills: work.skills || '',
        status: work.status || 'active',
        weekly_time_limit: work.weekly_time_limit || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('client.work.update', { id: work.id }));
    };

    return (
        <AppLayout>
            <Head title="Edit Work" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Edit Job</h1>
                
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Type your description here..."
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contract_type">Contract Type</Label>
                        <select
                            id="contract_type"
                            name="contract_type"
                            value={data.contract_type}
                            onChange={(e) => setData('contract_type', e.target.value as 'hourly' | 'monthly')}
                            className="mt-1 block w-full border rounded-md p-2"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                        <InputError message={errors.contract_type} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="rate">Rate ({data.contract_type === 'hourly' ? 'per hour' : 'per month'})</Label>
                        <Input
                            id="rate"
                            name="rate"
                            type="number"
                            value={data.rate}
                            onChange={(e) => setData('rate', Number(e.target.value))}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.rate} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="job_start_date">Job Start Date</Label>
                        <Input
                            id="job_start_date"
                            name="job_start_date"
                            type="date"
                            min={getMinDateForWork()}
                            value={data.job_start_date}
                            onChange={(e) => setData('job_start_date', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <p className="text-sm text-gray-500">
                            Date will display in US format (MM/DD/YYYY)
                        </p>
                        <InputError message={errors.job_start_date} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="duration">Contract Length</Label>
                        <select
                            id="duration"
                            name="duration"
                            value={data.duration}
                            onChange={(e) => setData('duration', e.target.value as 'short-term' | 'long-term' | 'indefinite')}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        >
                            <option value="short-term">Short term (0-3 months)</option>
                            <option value="long-term">Long term (6+ months)</option>
                            <option value="indefinite">Indefinite contract</option>
                        </select>
                        <InputError message={errors.duration} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="skills">Skills</Label>
                        <Input
                            id="skills"
                            name="skills"
                            value={data.skills}
                            onChange={(e) => setData('skills', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Enter required skills (comma-separated)"
                        />
                        <InputError message={errors.skills} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="weekly_time_limit">Weekly Time Limit (hours)</Label>
                        <Input
                            id="weekly_time_limit"
                            name="weekly_time_limit"
                            type="number"
                            value={data.weekly_time_limit}
                            onChange={(e) => setData('weekly_time_limit', Number(e.target.value))}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.weekly_time_limit} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value as 'active' | 'paused' | 'terminate')}
                            className="mt-1 block w-full border rounded-md p-2"
                        >
                            <option value="active">Active</option>
                            <option value="paused">Paused</option>
                            <option value="terminate">Terminate</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Update Work
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
