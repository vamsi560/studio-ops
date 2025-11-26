'use client';

import { useState, useMemo } from 'react';
import {
  Loader2,
  UploadCloud,
  AlertTriangle,
  GitCompareArrows,
  Sparkles,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
import { differenceInDays } from 'date-fns';
import { collection } from 'firebase/firestore';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  findBestCandidateForAllRRFs,
  type FindBestCandidateForAllRRFsOutput,
} from '@/ai/flows/find-best-candidate-for-all-rrfs';
import {
  summarizeResourceMatches,
} from '@/ai/flows/summarize-resource-matches';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCollection, useFirestore, useMemoFirebase, useUser } from '@/firebase';
import type { Resource, BenchAgeingData } from '@/lib/types';


type Stage = 'idle' | 'processing' | 'result' | 'error';

const chartConfig = {
  resources: {
    label: 'Resources',
    color: 'hsl(var(--chart-1))',
  },
};


export default function ResourceMappingPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [rrfFile, setRrfFile] = useState<File | null>(null);
  const [results, setResults] = useState<FindBestCandidateForAllRRFsOutput>([]);
  const [summary, setSummary] = useState<string>('');
  const { toast } = useToast();

  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const resourcesQuery = useMemoFirebase(
    () => (firestore && user ? collection(firestore, 'resources') : null),
    [firestore, user]
  );
  const { data: resources, isLoading: isLoadingResources } =
    useCollection<Resource>(resourcesQuery);

  const benchAgeingDataForChart = useMemo(() => {
    const today = new Date();
    const data: BenchAgeingData = { '0-30': 0, '31-60': 0, '61-90': 0, more_than_90: 0 };
    (resources || []).forEach(resource => {
      if (!resource.joiningDate) return;
       try {
        const daysOnBench = differenceInDays(today, new Date(resource.joiningDate));
        if (daysOnBench <= 30) data['0-30']++;
        else if (daysOnBench <= 60) data['31-60']++;
        else if (daysOnBench <= 90) data['61-90']++;
        else data.more_than_90++;
       } catch (e) {
        console.error("Invalid date for resource:", resource.vamid, resource.joiningDate);
       }
    });
    return [
        { name: '0-30 Days', resources: data['0-30'] },
        { name: '31-60 Days', resources: data['31-60'] },
        { name: '61-90 Days', resources: data['61-90'] },
        { name: '> 90 Days', resources: data.more_than_90 },
    ];
  }, [resources]);

  const isLoading = isUserLoading || isLoadingResources;


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setRrfFile(selectedFile);
      }
    };

  const handleFindMatches = async () => {
    if (!rrfFile) {
        toast({
            variant: 'destructive',
            title: 'Missing RRF File',
            description: 'Please upload an RRF file before starting the analysis.',
        });
        return;
    };
     if (!resources || resources.length === 0) {
        toast({
            variant: 'destructive',
            title: 'No Bench Data',
            description: 'There is no bench data in the database. Please upload a resource sheet on the main dashboard first.',
        });
        return;
    }

    setStage('processing');
    setSummary('');

    const readFileAsJson = (file: File): Promise<any[]> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          try {
            const data = new Uint8Array(reader.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            resolve(JSON.parse(JSON.stringify(json)));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });

    try {
      const rrfJson = await readFileAsJson(rrfFile);

      // Pre-process data to only send necessary columns to the AI
      const relevantRrfData = rrfJson.map(rrf => ({
        "RRF ID": rrf["RRF ID"],
        "POS Title": rrf["POS Title"],
        "Role": rrf["Role"],
      }));

      const relevantBenchData = resources.map(bench => ({
          "Name": bench.name,
          "VAMID": bench.vamid,
          "Skill": bench.primarySkill, // Using primarySkill as the key skill
      }));
      
      const apiResult = await findBestCandidateForAllRRFs({
        rrfsData: relevantRrfData,
        benchData: relevantBenchData,
      });

      setResults(apiResult);
      setStage('result');
      toast({
        title: "Analysis Complete",
        description: `Found potential matches for ${apiResult.length} RRFs.`
      })

      // Generate summary after getting results
      const summaryResult = await summarizeResourceMatches({ results: apiResult });
      setSummary(summaryResult.summary);

    } catch (error) {
      console.error('Candidate search failed:', error);
      setStage('error');
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: 'Could not perform the analysis. Please check the file and try again.',
      });
    }
  };

  const handleReset = () => {
    setStage('idle');
    setRrfFile(null);
    setResults([]);
    setSummary('');
  }

  const getSuitabilityBadge = (score: number) => {
    if (score > 90) return <Badge variant="default" className="bg-green-600">Excellent</Badge>
    if (score > 80) return <Badge variant="default" className="bg-blue-500">Good</Badge>
    if (score > 70) return <Badge variant="secondary">Fair</Badge>
    return <Badge variant="outline">Consider</Badge>
  }


  return (
    <DashboardLayout>
      <header className="bg-card border-b p-4 sm:p-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Resource Mapping</h2>
      </header>
      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Card>
          <CardContent className="p-4">
             <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" className="cursor-pointer">
                    <Label htmlFor="rrf-upload" className="cursor-pointer flex items-center">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Upload RRF File
                    </Label>
                  </Button>
                  {rrfFile && <p className="text-sm text-muted-foreground">{rrfFile.name}</p>}
                </div>
                 <Input
                    id="rrf-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".xlsx, .xls"
                    disabled={stage === 'processing'}
                  />
              </div>

              <div className="flex items-center gap-2">
                  {stage !== 'idle' && (
                      <Button variant="outline" onClick={handleReset} disabled={stage === 'processing'}>
                          Reset
                      </Button>
                  )}
                  <Button onClick={handleFindMatches} disabled={!rrfFile || stage === 'processing'}>
                      {stage === 'processing' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                          <GitCompareArrows className="mr-2 h-4 w-4" />
                      )}
                      Find All Matches
                  </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {stage === 'processing' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">Performing Bulk Analysis</h3>
                <p className="text-muted-foreground">AI is comparing all RRFs against the bench report from the database. <br/> This may take a moment...</p>
            </div>
        )}

        {stage === 'error' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h3 className="text-xl font-semibold">An Error Occurred</h3>
                <p className="text-muted-foreground">Something went wrong. Please check your file and try again.</p>
            </div>
        )}
        
        {stage === 'result' && summary && (
            <Card>
                <CardHeader className='flex-row items-start gap-4'>
                    <Sparkles className="size-6 text-accent" />
                    <div>
                        <CardTitle className="text-lg">AI Summary</CardTitle>
                        <CardDescription>A quick overview of the matching results.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {summary ? (
                        <p className="text-sm text-foreground">{summary}</p>
                    ) : (
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    )}
                </CardContent>
            </Card>
        )}


        {stage === 'result' && results.length > 0 && (
            <Card>
                <CardHeader>
                    <CardTitle>Analysis Results</CardTitle>
                    <CardDescription>
                        Top candidates from the bench for each RRF. Click on an RRF to see the recommended candidates.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {results.map((result, index) => (
                            <AccordionItem value={`item-${index}`} key={result.rrfId || index}>
                                <AccordionTrigger>
                                    <div className='flex justify-between w-full pr-4'>
                                        <span className='font-semibold'>RRF ID: {result.rrfId}</span>
                                        <span className='text-muted-foreground'>Top Match: {result.candidates[0]?.candidate.name} ({result.candidates[0]?.suitabilityScore}%)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                            <TableHead className='w-[200px]'>Candidate</TableHead>
                                            <TableHead>VAMID</TableHead>
                                            <TableHead>Score</TableHead>
                                            <TableHead>Suitability</TableHead>
                                            <TableHead className="text-right">Justification</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {result.candidates.map((match) => (
                                                <TableRow key={match.candidate.vamid}>
                                                    <TableCell className="font-medium">{match.candidate.name}</TableCell>
                                                    <TableCell>{match.candidate.vamid}</TableCell>
                                                    <TableCell>{match.suitabilityScore}%</TableCell>
                                                    <TableCell>{getSuitabilityBadge(match.suitabilityScore)}</TableCell>
                                                    <TableCell className="text-right text-muted-foreground text-xs">{match.justification}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        )}

        {stage === 'result' && results.length === 0 && (
             <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <h3 className="text-xl font-semibold">No Matches Found</h3>
                <p className="text-muted-foreground">The AI could not find any suitable matches for the provided RRF file against the bench data in the database.</p>
            </div>
        )}

        <Card>
            <CardHeader>
                <CardTitle>Bench Ageing Distribution</CardTitle>
                <CardDescription>
                Number of resources on the bench based on how long they have been available.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                <Skeleton className="h-[300px] w-full" />
                ) : (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer>
                    <BarChart data={benchAgeingDataForChart} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                        dataKey="name"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        />
                        <YAxis />
                        <Tooltip content={<ChartTooltipContent />} />
                        <Bar
                        dataKey="resources"
                        fill={chartConfig.resources.color}
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
