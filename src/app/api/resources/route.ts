import { NextRequest, NextResponse } from 'next/server';
import { getAllResources, createResources } from '@/lib/db/queries/resources';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function GET() {
  try {
    // Ensure database is initialized before querying
    await ensureDatabaseInitialized();
    
    const resources = await getAllResources();
    return NextResponse.json({ data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.stack : String(error);
    
    console.error('Full error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch resources',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const resources = Array.isArray(body) ? body : [body];
    
    const created = await createResources(resources);
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (error) {
    console.error('Error creating resources:', error);
    return NextResponse.json(
      { error: 'Failed to create resources' },
      { status: 500 }
    );
  }
}

