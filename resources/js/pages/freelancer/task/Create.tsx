import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type CreateTaskForm = {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
};

export default function Create() {
    const { data, setData, post, errors, processing } = useForm<Required<CreateTaskForm>>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        status: 'pending', // Default status
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('freelancer.task.store')); // Ensure this matches your backend route name
    };

    return (
        <AppLayout>
            <Head title="Create Task" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Create a New Task</h1>
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
                        <Label htmlFor="start_time">Start Time</Label>
                        <Input
                            id="start_time"
                            name="start_time"
                            type="datetime-local"
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.start_time} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="end_time">End Time</Label>
                        <Input
                            id="end_time"
                            name="end_time"
                            type="datetime-local"
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.end_time} />
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
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
