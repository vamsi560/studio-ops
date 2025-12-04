import { NextRequest, NextResponse } from 'next/server';
import { createRRFs } from '@/lib/db/queries/rrfs';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const { rrfs } = body;

    if (!rrfs || !Array.isArray(rrfs) || rrfs.length === 0) {
      return NextResponse.json(
        { error: 'RRFs array is required and must not be empty' },
        { status: 400 }
      );
    }

    const createdRRFs = await createRRFs(rrfs);

    return NextResponse.json({ 
      success: true,
      count: createdRRFs.length,
      rrfs: createdRRFs 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating RRFs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create RRFs',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDatabaseInitialized();

    const { getAllRRFs } = await import('@/lib/db/queries/rrfs');
    const rrfs = await getAllRRFs();

    return NextResponse.json(rrfs);
  } catch (error: any) {
    console.error('Error fetching RRFs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch RRFs',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

