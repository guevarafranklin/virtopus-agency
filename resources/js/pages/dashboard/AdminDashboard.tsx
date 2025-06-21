import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Users, Clock, TrendingUp, DollarSign } from 'lucide-react';
import { type BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/dashboard',
    },
];

interface MonthlyEarning {
    month: string;
    earnings: number;
}

interface Props {
    activeContracts: number;
    totalHours: number;
    monthlyEarnings: MonthlyEarning[];
    currentYear: number;
}

const chartConfig = {
  earnings: {
    label: "Earnings",
    color: "hsl(var(--chart-1))",
  },
}

export default function AdminDashboard({ activeContracts, totalHours, monthlyEarnings, currentYear }: Props) {
    const totalYearlyEarnings = monthlyEarnings.reduce((sum, item) => sum + item.earnings, 0);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin Dashboard" />
            
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Agency performance overview</p>
                </div>

                {/* Top Stats Cards */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Active Contracts Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{activeContracts}</div>
                            <p className="text-xs text-muted-foreground">
                                Freelancers currently assigned
                            </p>
                        </CardContent>
                    </Card>

                    {/* Total Hours Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hours This Month</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHours}h</div>
                            <p className="text-xs text-muted-foreground">
                                Billable hours worked by freelancers
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Agency Earnings Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Agency Earnings - {currentYear}
                        </CardTitle>
                        <CardDescription>
                            Monthly agency earnings from freelancer contracts
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <AreaChart
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
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Area
                                    dataKey="earnings"
                                    type="natural"
                                    fill="var(--color-earnings)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-earnings)"
                                    stackId="a"
                                />
                            </AreaChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Additional Stats */}
                <div className="grid gap-4 md:grid-cols-3">
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
                                Agency earnings for {currentYear}
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
                                {monthlyEarnings.reduce((max, item) => 
                                    item.earnings > max.earnings ? item : max, 
                                    monthlyEarnings[0] || { month: '-', earnings: 0 }
                                ).month}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${monthlyEarnings.reduce((max, item) => 
                                    item.earnings > max.earnings ? item : max, 
                                    monthlyEarnings[0] || { month: '-', earnings: 0 }
                                ).earnings.toFixed(2)} earned
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg Hours/Contract</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {activeContracts > 0 ? (totalHours / activeContracts).toFixed(1) : '0'}h
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per active contract this month
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}