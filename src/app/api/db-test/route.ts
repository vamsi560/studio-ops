import { NextResponse } from 'next/server';
import { pool } from '@/lib/db/config';
import { ensureDatabaseInitialized } from '@/lib/db/init';

export async function GET() {
  try {
    // Test connection
    const connectionTest = await pool.query('SELECT NOW() as current_time');
    
    // Check if tables exist
    const tableCheck = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('resources', 'excel_uploads', 'dashboard_metrics')
      ORDER BY table_name
    `);
    
    // Try to initialize if needed
    await ensureDatabaseInitialized();
    
    return NextResponse.json({
      success: true,
      connection: 'OK',
      currentTime: connectionTest.rows[0].current_time,
      tables: tableCheck.rows.map(r => r.table_name),
      message: 'Database connection successful'
    });
  } catch (error) {
    console.error('Database test error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : String(error);
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
    }, { status: 500 });
  }
}

