import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type CreateUserForm = {
    name: string;
    email: string;
    role: string;
};

export default function Create() {
    const { data, setData, post, errors, processing } = useForm<Required<CreateUserForm>>({
        name: '',
        email: '',
        role: 'client', // Default role
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // The default password will be set on the backend
        post(route('admin.user.store'));
    };

    return (
        <AppLayout>
            <Head title="Create User" />
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
                        <Button type="submit" disabled={processing}>
                            Create User
                        </Button>
                        <p className="text-sm text-gray-500">
                            Default password will be set: P@sswordVirtopus!2025
                        </p>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
