import { NextResponse } from 'next/server';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function POST() {
  try {
    await ensureDatabaseInitialized();
    return NextResponse.json({ success: true, message: 'Database initialized' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

