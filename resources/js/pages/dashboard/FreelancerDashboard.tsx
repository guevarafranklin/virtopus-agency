import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import { Briefcase, Clock, DollarSign, TrendingUp } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Freelancer Dashboard',
        href: '/dashboard',
    },
];

interface MonthlyEarning {
    month: string;
    earnings: number;
}

interface Props {
    totalContracts: number;
    activeContracts: number;
    monthlyHours: number;
    monthlyEarnings: MonthlyEarning[];
    currentYear: number;
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--chart-3))",
  },
}

export default function FreelancerDashboard({ totalContracts, activeContracts, monthlyHours, monthlyEarnings, currentYear }: Props) {
    const totalYearlyEarnings = monthlyEarnings.reduce((sum, item) => sum + item.earnings, 0);
    const bestMonth = monthlyEarnings.reduce((max, item) => 
        item.earnings > max.earnings ? item : max, 
        monthlyEarnings[0] || { month: '-', earnings: 0 }
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Freelancer Dashboard" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Freelancer Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Your work overview</p>
                </div>

                {/* Top Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Contracts</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalContracts}</div>
                            <p className="text-xs text-muted-foreground">
                                All time contracts
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeContracts}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently working
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{monthlyHours}h</div>
                            <p className="text-xs text-muted-foreground">
                                Billable hours logged
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Earnings Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5" />
                            Monthly Earnings - {currentYear}
                        </CardTitle>
                        <CardDescription>
                            Your earnings from completed work each month
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <LineChart
                                accessibilityLayer
                                data={monthlyEarnings}
                                margin={{
                                    left: 12,
                                    right: 12,
                                }}
                            >
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                />
                                <YAxis
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={8}
                                    tickFormatter={(value) => `$${value}`}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Line
                                    dataKey="earnings"
                                    type="natural"
                                    stroke="var(--color-earnings)"
                                    strokeWidth={2}
                                    dot={{
                                        fill: "var(--color-earnings)",
                                    }}
                                    activeDot={{
                                        r: 6,
                                    }}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Additional Stats */}
                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Yearly Earnings</CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                ${totalYearlyEarnings.toFixed(2)}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Total earned in {currentYear}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Best Month</CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {bestMonth.month}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${bestMonth.earnings.toFixed(2)} earned
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}