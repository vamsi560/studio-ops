'use client';
import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  startOfWeek,
  format,
  eachWeekOfInterval,
  subWeeks,
  endOfWeek,
} from 'date-fns';
import { collection } from 'firebase/firestore';

import { DashboardLayout } from '@/components/dashboard-layout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  useUser,
} from '@/firebase';
import type { Resource } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const chartConfig = {
  rrf: {
    label: 'RRFs',
    color: 'hsl(var(--chart-1))',
  },
  bench: {
    label: 'Bench',
    color: 'hsl(var(--chart-2))',
  },
};

export default function RrfBenchDashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resourcesQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'resources') : null),
    [firestore, user]
  );
  const { data: resources, isLoading: isLoadingResources } =
    useCollection<Resource>(resourcesQuery);

  const weeklyData = useMemo(() => {
    const today = new Date();
    const last12Weeks = eachWeekOfInterval(
      {
        start: subWeeks(today, 11),
        end: today,
      },
      { weekStartsOn: 1 } // Start week on Monday
    );

    return last12Weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
      const weekLabel = `${format(weekStart, 'MMM d')}`;

      // This is mock data since we don't have RRF data in firestore yet
      const rrfCount = Math.floor(Math.random() * 20) + 5;

      const benchCount =
        resources?.filter(r => {
          const joiningDate = new Date(r.joiningDate);
          return joiningDate >= weekStart && joiningDate <= weekEnd;
        }).length || 0;

      return {
        date: weekLabel,
        rrf: rrfCount,
        bench: benchCount,
      };
    });
  }, [resources]);

  const isLoading = isUserLoading || (user && isLoadingResources);

  return (
    <DashboardLayout>
      <header className="bg-card border-b p-4 sm:p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">RRF vs Bench Dashboard</h2>
      </header>
      <main className="p-4 sm:p-6 lg:p-8 grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Weekly RRF vs Bench Trend</CardTitle>
            <CardDescription>
              A comparison of incoming RRFs versus new additions to the bench over the last 12 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <ChartContainer config={chartConfig} className="h-[400px] w-full">
                <ResponsiveContainer>
                  <BarChart data={weeklyData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="rrf"
                      fill={chartConfig.rrf.color}
                      radius={4}
                    />
                    <Bar
                      dataKey="bench"
                      fill={chartConfig.bench.color}
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

         <Card>
          <CardHeader>
            <CardTitle>Weekly Bench Additions</CardTitle>
            <CardDescription>
              Number of resources added to the bench each week for the last 12 weeks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[400px] w-full" />
            ) : (
              <ChartContainer config={{bench: chartConfig.bench}} className="h-[400px] w-full">
                <ResponsiveContainer>
                  <BarChart data={weeklyData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                    />
                    <YAxis />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar
                      dataKey="bench"
                      fill={chartConfig.bench.color}
                      radius={4}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </main>
    </DashboardLayout>
  );
}
