import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/types';
import { toast } from 'sonner';

type EditUserForm = {
    name: string;
    email: string;
    role: string;
};

export default function Edit({ user }: { user: User }) {
    const { data, setData, put, errors, processing } = useForm<EditUserForm>({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'client',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.user.update', { id: user.id }));
    };

    const resetPassword = () => {
        put(route('admin.user.resetPassword', { id: user.id }), {
            onSuccess: () => toast.success('Password reset successfully'),
            onError: () => toast.error('Failed to reset password'),
        });
    };

    return (
        <AppLayout>
            <Head title="Edit User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="mt-1 block w-full"
                            required
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            name="role"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value)}
                            className="mt-1 block w-full border rounded-md p-2"
                            required
                        >
                            <option value="admin">Admin</option>
                            <option value="client">Client</option>
                            <option value="freelancer">Freelancer</option>
                        </select>
                        <InputError message={errors.role} />
                    </div>

                    <div className="flex items-center gap-4">
                        <Button type="submit" disabled={processing}>Save Changes</Button>
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={resetPassword}
                            disabled={processing}
                        >
                            Reset Password
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
