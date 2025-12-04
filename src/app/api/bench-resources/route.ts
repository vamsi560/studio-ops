import { NextRequest, NextResponse } from 'next/server';
import { createFullResources } from '@/lib/db/queries/resources-full';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const { resources } = body;

    if (!resources || !Array.isArray(resources) || resources.length === 0) {
      return NextResponse.json(
        { error: 'Resources array is required and must not be empty' },
        { status: 400 }
      );
    }

    const rowsAffected = await createFullResources(resources);

    return NextResponse.json({ 
      success: true,
      rowsAffected,
      message: `Successfully saved ${rowsAffected} resource(s) to database`
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error saving bench resources:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save bench resources',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

