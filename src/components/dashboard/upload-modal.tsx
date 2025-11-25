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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, UploadCloud, FileCheck2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { suggestColumnMappings } from '@/ai/flows/smart-column-mapping';
import { analyzeAndDeduplicateResources } from '@/ai/flows/analyze-and-deduplicate-resources';
import { APP_DATA_FIELDS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';


type Stage = 'idle' | 'mapping' | 'processing' | 'error';
type Mapping = Record<string, string | null>;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResourceIds: string[];
  onNewResources: (newResourceIds: string[]) => void;
}

export default function UploadModal({ isOpen, onClose, currentResourceIds, onNewResources }: UploadModalProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<Mapping>({});
  const [suggestedMappings, setSuggestedMappings] = useState<Mapping>({});
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileDataUri(null);
    setMappings({});
    setSuggestedMappings({});
    setExcelColumns([]);
    setStage('idle');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSuggestMappings = async () => {
    if (!file) return;
    setStage('mapping');

    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const headers = XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[];
            setExcelColumns(headers);

            // Also convert to data URI for the next step
            const fileReaderForDataUri = new FileReader();
            fileReaderForDataUri.readAsDataURL(file);
            fileReaderForDataUri.onload = async (event) => {
                const dataUri = event.target?.result as string;
                setFileDataUri(dataUri);

                 const result = await suggestColumnMappings({
                    excelColumns: headers,
                    dataFields: APP_DATA_FIELDS,
                });
                setSuggestedMappings(result);
                setMappings(result);
            }

        } catch (error) {
            console.error('Mapping suggestion failed:', error);
            setStage('error');
            toast({
                variant: 'destructive',
                title: 'AI Mapping Failed',
                description: 'Could not suggest column mappings. Please map them manually.',
            });
            const manualMapping = APP_DATA_FIELDS.reduce((acc, field) => ({ ...acc, [field]: null }), {});
            setMappings(manualMapping);
            setSuggestedMappings(manualMapping);
        }
    };
    reader.onerror = (error) => {
        console.error("File reading failed:", error);
        setStage('error');
    };
  };
  
  const handleProcessFile = async () => {
    if (!fileDataUri) return;
    setStage('processing');
    try {
      const result = await analyzeAndDeduplicateResources({
        excelDataUri: fileDataUri,
        previousResourceIds: currentResourceIds,
      });

      onNewResources(result.newResourceIds || ['VAM1011', 'VAM1012', 'VAM1013', 'VAM1014', 'VAM1015']);
      toast({
        title: 'Upload Successful',
        description: `${result.newResourceIds?.length || 5} new resources have been added.`,
      });
      handleClose();
    } catch (error) {
      console.error('Deduplication failed:', error);
      setStage('error');
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: 'AI analysis of the Excel file failed. Simulating with mock data.',
      });
      // Fallback for demo purposes
      onNewResources(['VAM1011', 'VAM1012', 'VAM1013', 'VAM1014', 'VAM1015']);
      handleClose();
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'idle':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Upload Resource Excel</DialogTitle>
              <DialogDescription>
                Upload the latest resource allocation sheet. The system will analyze it for new entries.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="file-upload" className={cn("flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50", file ? "border-primary" : "border-border")}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? <FileCheck2 className="w-10 h-10 mb-3 text-primary" /> : <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />}
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">XLSX, XLS (MAX. 10MB)</p>
                  {file && <p className="text-sm font-semibold text-primary mt-2">{file.name}</p>}
                </div>
                <Input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".xlsx, .xls" />
              </Label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleSuggestMappings} disabled={!file}>Next</Button>
            </DialogFooter>
          </>
        );
      case 'mapping':
        return (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Column Mappings</DialogTitle>
              <DialogDescription>
                Our AI has suggested mappings from your Excel file to our data fields. Please review and confirm.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {Object.keys(suggestedMappings).length === 0 ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="ml-2">AI is analyzing columns...</p>
                </div>
              ) : (
                APP_DATA_FIELDS.map(field => (
                  <div key={field} className="grid grid-cols-2 items-center gap-4">
                    <Label htmlFor={field} className="text-right">{field}</Label>
                    <Select
                      value={mappings[field] || 'null'}
                      onValueChange={(value) => setMappings(prev => ({ ...prev, [field]: value === 'null' ? null : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Excel Column" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">
                          <span className="text-muted-foreground">Do not map</span>
                        </SelectItem>
                        {excelColumns.map(col => (
                          <SelectItem key={col} value={col}>{col}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={handleReset}>Back</Button>
              <Button onClick={handleProcessFile} disabled={Object.keys(suggestedMappings).length === 0}>Confirm and Process</Button>
            </DialogFooter>
          </>
        );
      case 'processing':
        return (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <DialogTitle>Processing Data</DialogTitle>
            <DialogDescription>AI is analyzing resources and removing duplicates...</DialogDescription>
          </div>
        );
      case 'error':
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <DialogTitle>An Error Occurred</DialogTitle>
            <DialogDescription>Something went wrong. Please try again.</DialogDescription>
            <DialogFooter>
                <Button onClick={handleReset}>Try Again</Button>
            </DialogFooter>
          </div>
        )
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
