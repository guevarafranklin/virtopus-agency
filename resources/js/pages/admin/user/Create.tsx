import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';
import { Mail, Shield, User, Settings } from 'lucide-react';

interface CreateUserForm {
    name: string;
    email: string;
    role: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
}

export default function Create() {
    const { data, setData, post, errors, processing } = useForm<CreateUserForm>({
        name: '',
        email: '',
        role: 'client',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.user.store'));
    };

    const getRoleDescription = (role: string) => {
        switch (role) {
            case 'admin':
                return 'Full system access with user and contract management capabilities';
            case 'client':
                return 'Can post projects, hire freelancers, and manage contracts';
            case 'freelancer':
                return 'Can browse projects, submit proposals, and track time';
            default:
                return '';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin':
                return <Settings className="h-4 w-4" />;
            case 'client':
                return <User className="h-4 w-4" />;
            case 'freelancer':
                return <Shield className="h-4 w-4" />;
            default:
                return <User className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout>
            <Head title="Create User" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold">Create New User</h1>
                    <p className="text-gray-600 mt-2">Add a new user to the Virtopus Agency platform</p>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>User Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-6" onSubmit={handleSubmit}>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Enter full name"
                                            required
                                        />
                                        <InputError message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            className="mt-1 block w-full"
                                            placeholder="Enter email address"
                                            required
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="role">User Role</Label>
                                        <select
                                            id="role"
                                            name="role"
                                            value={data.role}
                                            onChange={(e) => setData('role', e.target.value)}
                                            className="mt-1 block w-full border rounded-md p-2"
                                            required
                                        >
                                            <option value="client">Client</option>
                                            <option value="freelancer">Freelancer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <InputError message={errors.role} />
                                        {data.role && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                                {getRoleIcon(data.role)}
                                                <span>{getRoleDescription(data.role)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-4 pt-4">
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Creating User...' : 'Create User'}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Information Sidebar */}
                    <div>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Email Notification
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">📧 Automatic Welcome Email</h4>
                                    <p className="text-sm text-blue-800">
                                        A welcome email with login credentials will be automatically sent to the user's email address.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Email includes:</h4>
                                    <ul className="text-sm text-gray-600 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>Welcome message and platform introduction</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>Secure temporary password</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>Direct login link</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>Role-specific next steps</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5">✓</span>
                                            <span>Support contact information</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-sm text-amber-800">
                                        <strong>Security:</strong> Users will be prompted to change their password on first login.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Role Information */}
                        <Card className="mt-4">
                            <CardHeader>
                                <CardTitle>Role Permissions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <Settings className="h-4 w-4 text-red-500" />
                                            Admin
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Complete platform control, user management, analytics
                                        </p>
                                    </div>

                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <User className="h-4 w-4 text-blue-500" />
                                            Client
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Post projects, hire freelancers, manage contracts
                                        </p>
                                    </div>

                                    <div className="border rounded-lg p-3">
                                        <div className="flex items-center gap-2 font-medium text-sm">
                                            <Shield className="h-4 w-4 text-green-500" />
                                            Freelancer
                                        </div>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Browse projects, submit proposals, track time
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
