'use client';
import { Code2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface SkillDistributionChartProps {
  data: { name: string; value: number }[];
}

const chartConfig = {
  value: {
    label: 'Resources',
  },
};

export default function SkillDistributionChart({ data }: SkillDistributionChartProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1.5">
          <CardTitle>Top Primary Skills</CardTitle>
          <CardDescription>Top 5 primary skills on the bench.</CardDescription>
        </div>
        <Code2 className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <ResponsiveContainer>
            <BarChart
              data={data}
              layout="horizontal"
              margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
