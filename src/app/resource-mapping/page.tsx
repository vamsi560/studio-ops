'use client';

import { useState } from 'react';
import {
  Loader2,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  GitCompareArrows,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
  findBestCandidateForAllRRFs,
  type FindBestCandidateForAllRRFsOutput,
} from '@/ai/flows/find-best-candidate-for-all-rrfs';
import { Badge } from '@/components/ui/badge';


type Stage = 'idle' | 'processing' | 'result' | 'error';


export default function ResourceMappingPage() {
  const [stage, setStage] = useState<Stage>('idle');
  const [rrfFile, setRrfFile] = useState<File | null>(null);
  const [benchFile, setBenchFile] = useState<File | null>(null);
  const [results, setResults] = useState<FindBestCandidateForAllRRFsOutput>([]);
  const { toast } = useToast();

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setter(selectedFile);
      }
    };

  const handleFindMatches = async () => {
    if (!rrfFile || !benchFile) return;
    setStage('processing');

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
            // Ensure plain objects by stringifying and parsing
            resolve(JSON.parse(JSON.stringify(json)));
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
      });

    try {
      const [rrfJson, benchJson] = await Promise.all([
        readFileAsJson(rrfFile),
        readFileAsJson(benchFile),
      ]);

      const apiResult = await findBestCandidateForAllRRFs({
        rrfsData: rrfJson,
        benchData: benchJson,
      });
      setResults(apiResult);
      setStage('result');
      toast({
        title: "Analysis Complete",
        description: `Found potential matches for ${apiResult.length} RRFs.`
      })
    } catch (error) {
      console.error('Candidate search failed:', error);
      setStage('error');
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description: 'Could not perform the analysis. Please check the files and try again.',
      });
    }
  };

  const handleReset = () => {
    setStage('idle');
    setRrfFile(null);
    setBenchFile(null);
    setResults([]);
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
          <CardHeader>
            <CardTitle>Bulk Candidate Analysis</CardTitle>
            <CardDescription>
              Upload an Excel sheet of all RRFs and a Bench Report to find the most suitable resources for each role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                    <Label htmlFor="rrf-upload">RRFs Sheet (Excel)</Label>
                    <Label
                    htmlFor="rrf-upload"
                    className={cn(
                        'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50',
                        rrfFile ? 'border-primary' : 'border-border'
                    )}
                    >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {rrfFile ? (
                        <FileCheck2 className="w-8 h-8 mb-2 text-primary" />
                        ) : (
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground px-2">
                        {rrfFile
                            ? rrfFile.name
                            : 'Click or drag & drop RRFs file'}
                        </p>
                    </div>
                    <Input
                        id="rrf-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange(setRrfFile)}
                        accept=".xlsx, .xls"
                        disabled={stage === 'processing'}
                    />
                    </Label>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="bench-upload">Bench Report (Excel)</Label>
                    <Label
                    htmlFor="bench-upload"
                    className={cn(
                        'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50',
                        benchFile ? 'border-primary' : 'border-border'
                    )}
                    >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                        {benchFile ? (
                        <FileCheck2 className="w-8 h-8 mb-2 text-primary" />
                        ) : (
                        <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                        )}
                        <p className="text-xs text-muted-foreground px-2">
                        {benchFile
                            ? benchFile.name
                            : 'Click or drag & drop Bench file'}
                        </p>
                    </div>
                    <Input
                        id="bench-upload"
                        type="file"
                        className="hidden"
                        onChange={handleFileChange(setBenchFile)}
                        accept=".xlsx, .xls"
                        disabled={stage === 'processing'}
                    />
                    </Label>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                {stage !== 'idle' && (
                    <Button variant="outline" onClick={handleReset} disabled={stage === 'processing'}>
                        Reset
                    </Button>
                )}
                <Button onClick={handleFindMatches} disabled={!rrfFile || !benchFile || stage === 'processing'}>
                    {stage === 'processing' ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <GitCompareArrows className="mr-2 h-4 w-4" />
                    )}
                    Find All Matches
                </Button>
            </div>
          </CardContent>
        </Card>

        {stage === 'processing' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h3 className="text-xl font-semibold">Performing Bulk Analysis</h3>
                <p className="text-muted-foreground">AI is comparing all RRFs against the bench report. <br/> This may take a moment...</p>
            </div>
        )}

        {stage === 'error' && (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                <AlertTriangle className="h-12 w-12 text-destructive" />
                <h3 className="text-xl font-semibold">An Error Occurred</h3>
                <p className="text-muted-foreground">Something went wrong. Please check your files and try again.</p>
            </div>
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
                <p className="text-muted-foreground">The AI could not find any suitable matches in the provided files.</p>
            </div>
        )}

      </main>
    </DashboardLayout>
  );
}
