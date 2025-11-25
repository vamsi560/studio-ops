'use client';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Loader2,
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  UserCheck,
  Star,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  findBestCandidate,
  type FindBestCandidateOutput,
} from '@/ai/flows/find-best-candidate';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import * as XLSX from 'xlsx';

type Stage = 'idle' | 'processing' | 'result' | 'error';

interface FindCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FindCandidateModal({
  isOpen,
  onClose,
}: FindCandidateModalProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [rrfFile, setRrfFile] = useState<File | null>(null);
  const [benchFile, setBenchFile] = useState<File | null>(null);
  const [result, setResult] = useState<FindBestCandidateOutput | null>(null);
  const { toast } = useToast();

  const handleFileChange =
    (setter: React.Dispatch<React.SetStateAction<File | null>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setter(selectedFile);
      }
    };

  const handleReset = () => {
    setStage('idle');
    setRrfFile(null);
    setBenchFile(null);
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleFindCandidate = async () => {
    if (!rrfFile || !benchFile) return;
    setStage('processing');

    const readFileAsJson = (file: File): Promise<string> =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
            const data = new Uint8Array(reader.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet);
            resolve(JSON.stringify(json, null, 2));
        };
        reader.onerror = reject;
      });

    try {
      const [rrfJson, benchJson] = await Promise.all([
        readFileAsJson(rrfFile),
        readFileAsJson(benchFile),
      ]);

      const apiResult = await findBestCandidate({
        rrfData: rrfJson,
        benchData: benchJson,
      });
      setResult(apiResult);
      setStage('result');
    } catch (error) {
      console.error('Candidate search failed:', error);
      setStage('error');
      toast({
        variant: 'destructive',
        title: 'AI Analysis Failed',
        description:
          'Could not find a candidate. Please check the files and try again.',
      });
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'idle':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Find Best Candidate</DialogTitle>
              <DialogDescription>
                Upload an RRF and a Bench Report to find the most suitable
                resource.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rrf-upload">RRF (Excel)</Label>
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
                        : 'Click or drag & drop RRF file'}
                    </p>
                  </div>
                  <Input
                    id="rrf-upload"
                    type="file"
                    className="hidden"
                    onChange={handleFileChange(setRrfFile)}
                    accept=".xlsx, .xls"
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
                  />
                </Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                onClick={handleFindCandidate}
                disabled={!rrfFile || !benchFile}
              >
                Find Candidate
              </Button>
            </DialogFooter>
          </>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <DialogTitle>Finding Best Candidate</DialogTitle>
            <DialogDescription>
              AI is analyzing both files to find the perfect match...
            </DialogDescription>
          </div>
        );
      case 'result':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Top Candidate Found</DialogTitle>
              <DialogDescription>
                Based on the provided files, here is the most suitable
                candidate.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Card className="bg-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-primary">
                    {result?.candidate.name}
                  </CardTitle>
                  <UserCheck className="h-6 w-6 text-primary" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    VAMID: {result?.candidate.vamid}
                  </p>
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-400" />
                    <p className="text-lg font-semibold">
                      {result?.suitabilityScore}% Match
                    </p>
                  </div>
                  <div className="space-y-1">
                     <div className='flex items-center gap-2'>
                        <Sparkles className="h-4 w-4 text-accent" />
                        <h4 className="font-semibold">AI Justification:</h4>
                     </div>
                    <p className="text-sm text-muted-foreground italic">
                      "{result?.justification}"
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>
                Start Over
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <DialogTitle>An Error Occurred</DialogTitle>
            <DialogDescription>
              Something went wrong. Please check your files and try again.
            </DialogDescription>
            <DialogFooter>
              <Button onClick={handleReset}>Try Again</Button>
            </DialogFooter>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
