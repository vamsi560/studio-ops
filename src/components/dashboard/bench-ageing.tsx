import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BenchAgeingData } from '@/lib/types';

interface BenchAgeingProps {
  data: BenchAgeingData;
}

const ageingBrackets = [
  { key: '0-30' as const, label: '0-30 Days', color: 'bg-green-500' },
  { key: '31-60' as const, label: '31-60 Days', color: 'bg-orange-400' },
  { key: '61-90' as const, label: '61-90 Days', color: 'bg-yellow-500' },
  { key: 'more_than_90' as const, label: '> 90 Days', color: 'bg-red-500' },
];

export default function BenchAgeing({ data }: BenchAgeingProps) {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);

  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">Bench Ageing</CardTitle>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4 pt-2">
          {ageingBrackets.map(bracket => (
             <div key={bracket.key} className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                    <p className='font-medium'>{bracket.label}</p>
                    <p className='text-muted-foreground'>{data[bracket.key]} Resources</p>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", bracket.color)} style={{ width: total > 0 ? `${(data[bracket.key] / total) * 100}%` : '0%' }}></div>
                </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
