import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';

interface Task {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
}

export default function Edit({ task }: { task: Task }) {
    const { data, setData, put, errors, processing } = useForm({
        title: task.title,
        description: task.description,
        start_time: task.start_time,
        end_time: task.end_time,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('freelancer.task.update', { id: task.id }));
    };

    return (
        <AppLayout>
            <Head title="Edit Task" />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                        id="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                    />
                    <InputError message={errors.title} />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} />
                </div>
                <div>
                    <Label htmlFor="start_time">Start Time</Label>
                    <Input
                        id="start_time"
                        type="datetime-local"
                        value={data.start_time}
                        onChange={(e) => setData('start_time', e.target.value)}
                    />
                    <InputError message={errors.start_time} />
                </div>
                <div>
                    <Label htmlFor="end_time">End Time</Label>
                    <Input
                        id="end_time"
                        type="datetime-local"
                        value={data.end_time}
                        onChange={(e) => setData('end_time', e.target.value)}
                    />
                    <InputError message={errors.end_time} />
                </div>
                <Button type="submit" disabled={processing}>
                    Save Changes
                </Button>
            </form>
        </AppLayout>
    );
}
