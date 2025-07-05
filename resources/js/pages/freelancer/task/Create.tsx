import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Contract } from '@/types';

type CreateTaskForm = {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    status: string;
    contract_id: number | null;
    is_billable: boolean;
};

interface Props {
    contracts: Contract[];
}

export default function Create({ contracts }: Props) {
    const { data, setData, post, errors, processing } = useForm<Required<CreateTaskForm>>({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        status: 'pending',
        contract_id: null,
        is_billable: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('freelancer.task.store'));
    };

    const calculateDuration = (start: string, end: string) => {
        if (!start || !end) return '0:00:00';
        const startTime = new Date(start);
        const endTime = new Date(end);
        const duration = endTime.getTime() - startTime.getTime();
        
        if (duration <= 0) return '0:00:00';
        
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((duration % (1000 * 60)) / 1000);
        
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const formatTime12Hour = (time24: string) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const convertTo24Hour = (time12: string) => {
        if (!time12) return '';
        const [time, ampm] = time12.split(' ');
        const [hours, minutes] = time.split(':');
        let hour = parseInt(hours);
        
        if (ampm === 'PM' && hour !== 12) hour += 12;
        if (ampm === 'AM' && hour === 12) hour = 0;
        
        return `${hour.toString().padStart(2, '0')}:${minutes}`;
    };

    const handleDateChange = (date: string) => {
        // Update both start_time and end_time with the new date
        if (data.start_time) {
            const currentStartTime = data.start_time.split('T')[1] || '09:00';
            setData('start_time', `${date}T${currentStartTime}`);
        }
        if (data.end_time) {
            const currentEndTime = data.end_time.split('T')[1] || '17:00';
            setData('end_time', `${date}T${currentEndTime}`);
        }
    };

    const handleStartTimeChange = (time: string) => {
        const currentDate = data.start_time.split('T')[0] || new Date().toISOString().split('T')[0];
        setData('start_time', `${currentDate}T${time}`);
    };

    const handleEndTimeChange = (time: string) => {
        const currentDate = data.end_time.split('T')[0] || data.start_time.split('T')[0] || new Date().toISOString().split('T')[0];
        setData('end_time', `${currentDate}T${time}`);
    };

    const selectedContract = contracts.find(c => c.id === data.contract_id);

    return (
        <AppLayout>
            <Head title="Create Task" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <h1 className="text-2xl font-bold mb-4">Create a New Task</h1>
                
                {/* Weekly Hours Warning */}
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
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Task</Label>
                        <Input
                            id="title"
                            name="title"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                            placeholder="Enter task name"
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

                    {/* Simplified Date/Time Section */}
                    <div className="grid gap-4">
                        <Label className="text-base font-semibold">Task Schedule</Label>
                        
                        {/* Date Selection */}
                        <div className="grid gap-2">
                            <Label htmlFor="task_date">Date</Label>
                            <Input
                                id="task_date"
                                type="date"
                                value={data.start_time.split('T')[0] || ''}
                                onChange={(e) => handleDateChange(e.target.value)}
                                className="w-full"
                                required
                            />
                            <InputError message={errors.start_time} />
                        </div>

                        {/* Time Selection Row */}
                        <div className="grid grid-cols-4 gap-4 items-end">
                            <div className="grid gap-2">
                                <Label htmlFor="start_time">Start Time</Label>
                                <Input
                                    id="start_time"
                                    type="time"
                                    value={data.start_time.split('T')[1] || ''}
                                    onChange={(e) => handleStartTimeChange(e.target.value)}
                                    className="w-full"
                                    required
                                />
                            </div>
                            
                            <div className="flex items-center justify-center pb-2">
                                <span className="text-gray-500">→</span>
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="end_time">End Time</Label>
                                <Input
                                    id="end_time"
                                    type="time"
                                    value={data.end_time.split('T')[1] || ''}
                                    onChange={(e) => handleEndTimeChange(e.target.value)}
                                    className="w-full"
                                    required
                                />
                            </div>
                            
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Duration</Label>
                                <Input
                                    id="duration"
                                    value={calculateDuration(data.start_time, data.end_time)}
                                    className="w-full font-mono text-center"
                                    readOnly
                                />
                            </div>
                        </div>
                        
                        {/* Display formatted times */}
                        {data.start_time && data.end_time && (
                            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                <strong>Preview:</strong> {new Date(data.start_time).toLocaleDateString('en-US')} from {formatTime12Hour(data.start_time.split('T')[1])} to {formatTime12Hour(data.end_time.split('T')[1])}
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
