import { Button } from '@/components/ui/button';
import { Upload, UserSearch } from 'lucide-react';

type HeaderProps = {
  onUploadClick: () => void;
  onFindCandidateClick: () => void;
};

export default function Header({ onUploadClick, onFindCandidateClick }: HeaderProps) {
  return (
    <header className="bg-card border-b p-4 sm:p-6 flex items-center justify-between">
      <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      <div className="flex items-center gap-2">
        <Button onClick={onFindCandidateClick} variant="outline">
          <UserSearch className="mr-2 h-4 w-4" />
          Find Candidate
        </Button>
        <Button onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Excel
        </Button>
      </div>
    </header>
  );
}
