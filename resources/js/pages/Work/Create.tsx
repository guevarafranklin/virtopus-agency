import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRef } from 'react';
import { Textarea } from '@headlessui/react';


type CreateWorkForm = {
    title: string;
    description: string;
    budget: number;
    duration: number;
}
export default function Create() {
    const workName = useRef<HTMLInputElement>(null);
    const { data, setData, errors, post, reset, processing } = useForm<Required<CreateWorkForm>>({
        title: '',
        description: '',
        budget: 0,
        duration: 0,
    });
    return (
        <AppLayout>
            <Head title="Create Job" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <form className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            name="title"
                            ref={workName}
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Textarea
                            id="description"
                            name="description"
                            ref={workName}
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                            className="mt-1 block w-full"
                        />
                        <InputError message={errors.description} />
                    </div>
                    <div className="flex items-center gap-4">
                        <Button disabled={processing}>Create Job</Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
