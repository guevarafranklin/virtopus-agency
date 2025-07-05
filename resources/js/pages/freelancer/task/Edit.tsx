import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import { ArrowLeft } from 'lucide-react';

interface Task {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
    is_billable: boolean;
    contract_id?: number;
    contract?: {
        id: number;
        work: {
            title: string;
            rate: number;
            contract_type: string;
        };
        agency_rate: number;
    };
}

interface Contract {
    id: number;
    work: {
        title: string;
        rate: number;
        contract_type: string;
        weekly_time_limit: number;
    };
    agency_rate: number;
}

interface Props {
    task: Task;
    contracts: Contract[];
}

export default function Edit({ task, contracts }: Props) {
    // Convert datetime to local format for input fields
    const formatDateTimeForInput = (dateTimeString: string): string => {
        if (!dateTimeString) return '';
        
        try {
            const date = new Date(dateTimeString);
            // Format for datetime-local input (YYYY-MM-DDTHH:MM)
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        } catch (error) {
            console.error('Error formatting datetime for input:', error);
            return '';
        }
    };

    const { data, setData, put, errors, processing } = useForm({
        title: task.title,
        description: task.description,
        start_time: formatDateTimeForInput(task.start_time),
        end_time: formatDateTimeForInput(task.end_time),
        status: task.status,
        contract_id: task.contract_id || null,
        is_billable: task.is_billable,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('freelancer.task.update', task.id));
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return 'N/A';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime.getTime() - startTime.getTime();
        
        if (diffMs <= 0) return 'Invalid duration';
        
        const diffHours = diffMs / (1000 * 60 * 60);
        const hours = Math.floor(diffHours);
        const minutes = Math.floor((diffHours - hours) * 60);
        return `${hours}h ${minutes}m`;
    };

    const calculateHours = (start: string, end: string): number => {
        if (!start || !end) return 0;
        const startTime = new Date(start);
        const endTime = new Date(end);
        const diffMs = endTime.getTime() - startTime.getTime();
        return diffMs > 0 ? diffMs / (1000 * 60 * 60) : 0;
    };

    const selectedContract = contracts.find(c => c.id === data.contract_id);
    const taskHours = calculateHours(data.start_time, data.end_time);

    return (
        <AppLayout>
            <Head title="Edit Task" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Header with back button */}
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">Edit Task</h1>
                    <Link
                        href={route('freelancer.task.index')}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tasks
                    </Link>
                </div>

                {/* Contract Info */}
                {data.is_billable && selectedContract && (
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                        <p className="text-sm text-blue-800">
                            <strong>Contract:</strong> {selectedContract.work.title}<br/>
                            <strong>Weekly Limit:</strong> {selectedContract.work.weekly_time_limit} hours<br/>
                            <strong>My Rate:</strong> ${((selectedContract.work.rate * (100 - selectedContract.agency_rate)) / 100).toFixed(2)}/hr
                            {selectedContract.work.contract_type === 'monthly' && (
                                <span className="text-xs block mt-1">
                                    (Fixed monthly rate contract)
                                </span>
                            )}
                        </p>
                        {data.is_billable && taskHours > 0 && (
                            <div className="mt-2 text-sm text-blue-700">
                                <strong>This task:</strong> {taskHours.toFixed(1)} hours
                            </div>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                            id="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            placeholder="Enter task name"
                            required
                        />
                        <InputError message={errors.title} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            placeholder="Describe the task details..."
                        />
                        <InputError message={errors.description} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="contract_id">Contract (Optional)</Label>
                        <select
                            id="contract_id"
                            name="contract_id"
                            value={data.contract_id || ''}
                            onChange={(e) => setData('contract_id', e.target.value ? Number(e.target.value) : null)}
                            className="mt-1 block w-full border rounded-md p-2"
                        >
                            <option value="">No Contract (Non-billable)</option>
                            {contracts.map((contract) => (
                                <option key={contract.id} value={contract.id}>
                                    {contract.work.title} - ${((contract.work.rate * (100 - contract.agency_rate)) / 100).toFixed(2)}/{contract.work.contract_type === 'hourly' ? 'hr' : 'month'}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.contract_id} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="is_billable"
                                checked={data.is_billable}
                                onChange={(e) => setData('is_billable', e.target.checked)}
                                disabled={!data.contract_id}
                                className="rounded"
                            />
                            <Label htmlFor="is_billable">Make this task billable</Label>
                        </div>
                        {!data.contract_id && (
                            <p className="text-sm text-gray-500">
                                Select a contract to make this task billable
                            </p>
                        )}
                        <InputError message={errors.is_billable} />
                    </div>

                    <div className="grid gap-4">
                        <Label className="text-base font-semibold">Time Tracking</Label>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="datetime-local"
                                    value={data.start_time}
                                    onChange={(e) => setData('start_time', e.target.value)}
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    Time will display in US format (MM/DD/YYYY, 12-hour clock)
                                </p>
                                <InputError message={errors.start_time} />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="datetime-local"
                                    value={data.end_time}
                                    onChange={(e) => setData('end_time', e.target.value)}
                                    required
                                />
                                <p className="text-sm text-gray-500">
                                    Time will display in US format (MM/DD/YYYY, 12-hour clock)
                                </p>
                                <InputError message={errors.end_time} />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                                id="duration"
                                name="duration"
                                value={data.start_time && data.end_time ? calculateDuration(data.start_time, data.end_time) : 'N/A'}
                                className="mt-1 block w-full font-mono"
                                readOnly
                            />
                        </div>

                        {/* Duration preview */}
                        {data.start_time && data.end_time && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                <strong>Preview:</strong> {calculateDuration(data.start_time, data.end_time)}
                                {data.is_billable && (
                                    <span className="block mt-1">
                                        <strong>Billable Hours:</strong> {taskHours.toFixed(1)}h
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            name="status"
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving Changes...' : 'Save Changes'}
                        </Button>
                        
                        <Link
                            href={route('freelancer.task.index')}
                            className="inline-flex items-center justify-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors duration-200"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
