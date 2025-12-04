import { NextRequest, NextResponse } from 'next/server';
import { createExcelUpload } from '@/lib/db/queries/excel-uploads';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();

    const body = await request.json();
    const { fileName, fileSize, uploadedBy, rowsProcessed, status, fileType } = body;

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    const upload = await createExcelUpload({
      fileName,
      fileSize: fileSize || null,
      uploadedBy: uploadedBy || null,
      rowsProcessed: rowsProcessed || null,
      status: status || 'completed',
      fileType: fileType || null,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error: any) {
    console.error('Error creating Excel upload record:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Excel upload record',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await ensureDatabaseInitialized();

    const { getAllExcelUploads } = await import('@/lib/db/queries/excel-uploads');
    const uploads = await getAllExcelUploads();

    return NextResponse.json(uploads);
  } catch (error: any) {
    console.error('Error fetching Excel uploads:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Excel uploads',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

