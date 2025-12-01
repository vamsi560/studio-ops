import { NextRequest, NextResponse } from 'next/server';
import { getAllResources, createResources } from '@/lib/db/queries/resources';

export async function GET() {
  try {
    const resources = await getAllResources();
    return NextResponse.json({ data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
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

