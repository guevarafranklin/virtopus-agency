import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type EditWorkForm = {
    id: number;
    title: string;
    description: string;
    budget: number;
    duration: number;
    skills: string;
    status: string;
};

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
        budget: work.budget || 0,
        duration: work.duration || 0,
        skills: work.skills || '',
        status: work.status || 'open',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('client.work.update', { id: work.id }));
    };

    return (
        <AppLayout>
            <Head title="Edit Work" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
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
                        <Label htmlFor="budget">Budget</Label>
                        <Input
                            id="budget"
                            name="budget"
                            value={data.budget}
                            onChange={(e) => setData('budget', Number(e.target.value) || 0)}
                            className="mt-1 block w-full"
                            type="number"
                        />
                        <InputError message={errors.budget} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="duration">Duration (in days)</Label>
                        <Input
                            id="duration"
                            name="duration"
                            value={data.duration}
                            onChange={(e) => setData('duration', Number(e.target.value) || 0)}
                            className="mt-1 block w-full"
                            type="number"
                        />
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
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2"
                        >
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Save Changes</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
