import { useForm } from '@inertiajs/react';

export default function TaskForm() {
    const { data, setData, post, processing } = useForm({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('task.store')); // Ensure this matches the backend route name
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                name="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
            />
            <button type="submit" disabled={processing}>
                Save Task
            </button>
        </form>
    );
}