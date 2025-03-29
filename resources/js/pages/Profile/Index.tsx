import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"




export default function Index() {
    return (
        <AppLayout>
            <Head title="My Profile" />
            <div>
                <h1>My Profile</h1>
            </div>
        </AppLayout>
    );
}
