import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';

type TaskFormProps = {
    onSubmit: (data: {
        title: string;
        description: string;
        budget: number;
        duration: number;
        skills: string;
        status: string;
    }) => void;
    initialData?: {
        title?: string;
        description?: string;
        budget?: number;
        duration?: number;
        skills?: string;
        status?: string;
    };
    processing?: boolean;
    errors?: Record<string, string>;
};

export default function TaskForm({
    onSubmit,
    initialData = {
        title: '',
        description: '',
        budget: 0,
        duration: 0,
        skills: '',
        status: 'open',
    },
    processing = false,
    errors = {},
}: TaskFormProps) {
    const { data, setData } = useForm(initialData);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            title: data.title || '',
            description: data.description || '',
            budget: data.budget || 0,
            duration: data.duration || 0,
            skills: data.skills || '',
            status: data.status || 'open',
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    onChange={(e) => setData('budget', Number(e.target.value))}
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
                    onChange={(e) => setData('duration', Number(e.target.value))}
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
                <Button type="submit" disabled={processing}>
                    Save Task
                </Button>
            </div>
        </form>
    );
}