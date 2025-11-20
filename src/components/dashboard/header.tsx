import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

type HeaderProps = {
  onUploadClick: () => void;
};

export default function Header({ onUploadClick }: HeaderProps) {
  return (
    <header className="bg-card border-b p-4 sm:p-6 flex items-center justify-between">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <Button onClick={onUploadClick}>
        <Upload className="mr-2 h-4 w-4" />
        Upload Excel
      </Button>
    </header>
  );
}
