'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function InitDbPage() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const initializeDatabase = async () => {
    setStatus('loading');
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/init-db', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Database initialized successfully!');
      } else {
        setStatus('error');
        setError(data.details || data.error || 'Failed to initialize database');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  const testConnection = async () => {
    setStatus('loading');
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/db-test');
      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(`Connection OK! Tables found: ${data.tables?.join(', ') || 'none'}`);
      } else {
        setStatus('error');
        setError(data.error || 'Database connection failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Database Initialization</h1>
      
      <div className="space-y-4 mb-6">
        <Button 
          onClick={testConnection} 
          disabled={status === 'loading'}
          variant="outline"
          className="w-full"
        >
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Database Connection
        </Button>

        <Button 
          onClick={initializeDatabase} 
          disabled={status === 'loading'}
          className="w-full"
        >
          {status === 'loading' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Initialize Database Tables
        </Button>
      </div>

      {status === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

