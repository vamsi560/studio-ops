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
import { APP_DATA_FIELDS } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import type { Resource } from '@/lib/types';


type Stage = 'idle' | 'mapping' | 'processing' | 'error';
type Mapping = Record<string, string | null>;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentResourceIds: string[];
  onNewResources: (newResources: Partial<Resource>[]) => void;
}

export default function UploadModal({ isOpen, onClose, currentResourceIds, onNewResources }: UploadModalProps) {
  const [stage, setStage] = useState<Stage>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [excelData, setExcelData] = useState<any[]>([]);
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
    setMappings({});
    setSuggestedMappings({});
    setExcelColumns([]);
    setExcelData([]);
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
            const headers = (XLSX.utils.sheet_to_json(worksheet, { header: 1 })[0] as string[]).filter(Boolean);
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            setExcelColumns(headers);
            setExcelData(jsonData);

            const result = await suggestColumnMappings({
                excelColumns: headers,
                dataFields: APP_DATA_FIELDS,
            });
            setSuggestedMappings(result);
            setMappings(result);

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
    setStage('processing');
    try {
        const appFieldToExcelColumn = Object.fromEntries(
            Object.entries(mappings).map(([appField, excelCol]) => [appField, excelCol])
        );
        
        const newResources: Partial<Resource>[] = excelData
            .map(row => {
                const resource: Partial<Resource> = {};
                for (const appField of APP_DATA_FIELDS) {
                    const excelCol = appFieldToExcelColumn[appField];
                    if (excelCol && row[excelCol] !== undefined) {
                        const value = row[excelCol];
                        // A bit of type conversion and mapping logic
                        if (appField === 'VAMID') resource.vamid = String(value);
                        if (appField === 'Name') resource.name = String(value);
                        if (appField === 'Joining Date') {
                            if (typeof value === 'number') {
                                const date = XLSX.SSF.parse_date_code(value);
                                resource.joiningDate = new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
                            } else if (typeof value === 'string') {
                                const parsedDate = new Date(value);
                                if (!isNaN(parsedDate.getTime())) {
                                   resource.joiningDate = parsedDate.toISOString().split('T')[0];
                                }
                            }
                        }
                        if (appField === 'Grade') resource.grade = String(value);
                        if (appField === 'Primary Skill') resource.primarySkill = String(value);
                        if (appField === 'Current Skill') resource.currentSkill = String(value);
                        if (appField === 'Total Exp') {
                            const exp = Number(value);
                            if (!isNaN(exp)) resource.totalExp = exp;
                        }
                    }
                }
                return resource;
            })
            .filter(r => r.vamid && !currentResourceIds.includes(r.vamid));

      if (newResources.length > 0) {
        onNewResources(newResources);
        toast({
          title: 'Upload Successful',
          description: `${newResources.length} new resources have been added to the database.`,
        });
      } else {
         toast({
          title: 'No New Resources',
          description: `All resources in the file already exist in the database.`,
        });
      }
      handleClose();
    } catch (error) {
      console.error('File processing failed:', error);
      setStage('error');
      toast({
        variant: 'destructive',
        title: 'Processing Failed',
        description: 'Could not process the Excel file.',
      });
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
                Upload the latest resource allocation sheet. The system will analyze it and save new entries to the database.
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
            <DialogDescription>Identifying new resources and saving them to the database...</DialogDescription>
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
