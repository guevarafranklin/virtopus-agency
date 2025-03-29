import AppLayout from '@/layouts/app-layout';
import { Head, Link, router} from '@inertiajs/react';
import { toast} from 'sonner';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Work } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';


export default function Index( { works }: { works: Work[] }) {
    const deleteWork = (id: number) => {
        if (confirm('Are you sure you want to delete this work?')) {
            router.delete(route('work.destroy', { id }));
            toast.success('Task deleted successfully');
        }
    }
    return (
        <AppLayout>
            <Head title="Jobs" />
            <div className={'mt-8'}>
                <Link className={buttonVariants({ variant: 'outline' })} href="/work/create">
                    Create Job
                </Link>
                <Table className={'mt-4'}>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead className="w-[100px]">Description</TableHead>
                            <TableHead className="w-[150px] text-right">Budget</TableHead>
                            <TableHead className="w-[150px] text-right">Duration</TableHead>
                            <TableHead className="w-[150px] text-right">Status</TableHead>
                            <TableHead className="w-[150px] text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {works.map((work) => (
                            <TableRow key={work.id}>
                                <TableCell>{work.title}</TableCell>
                                <TableCell className="text-wrap">{work.description}</TableCell>
                                <TableCell className="text-right">{work.budget}</TableCell>
                                <TableCell className="text-right">{work.duration}</TableCell>
                                <TableCell className="text-right">{work.status}</TableCell>
                                <TableCell className="flex flex-row gap-x-2 text-right">
                                    <Button variant={'destructive'} className={'cursor-pointer'} onClick={() => deleteWork(work.id)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}

                    </TableBody>
                </Table>
            </div>
        </AppLayout>
    );
}
