import { pool } from '../config';

export interface ExcelUpload {
  id: number;
  fileName: string;
  fileSize: number | null;
  uploadDate: Date;
  uploadedBy: string | null;
  rowsProcessed: number | null;
  status: string;
  fileType?: string; // 'rrf' | 'bench' | 'resource'
}

// Create Excel upload record
export async function createExcelUpload(data: {
  fileName: string;
  fileSize?: number;
  uploadedBy?: string;
  rowsProcessed?: number;
  status?: string;
  fileType?: string;
}): Promise<ExcelUpload> {
  const result = await pool.query(`
    INSERT INTO excel_uploads (
      file_name, file_size, uploaded_by, rows_processed, status
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING 
      id,
      file_name as "fileName",
      file_size as "fileSize",
      upload_date as "uploadDate",
      uploaded_by as "uploadedBy",
      rows_processed as "rowsProcessed",
      status
  `, [
    data.fileName,
    data.fileSize || null,
    data.uploadedBy || null,
    data.rowsProcessed || null,
    data.status || 'completed',
  ]);

  const row = result.rows[0];
  return {
    id: row.id,
    fileName: row.fileName,
    fileSize: row.fileSize,
    uploadDate: row.uploadDate,
    uploadedBy: row.uploadedBy,
    rowsProcessed: row.rowsProcessed,
    status: row.status,
    fileType: data.fileType,
  };
}

// Get all Excel uploads
export async function getAllExcelUploads(): Promise<ExcelUpload[]> {
  const result = await pool.query(`
    SELECT 
      id,
      file_name as "fileName",
      file_size as "fileSize",
      upload_date as "uploadDate",
      uploaded_by as "uploadedBy",
      rows_processed as "rowsProcessed",
      status
    FROM excel_uploads
    ORDER BY upload_date DESC
  `);

  return result.rows;
}

// Get Excel upload by ID
export async function getExcelUploadById(id: number): Promise<ExcelUpload | null> {
  const result = await pool.query(`
    SELECT 
      id,
      file_name as "fileName",
      file_size as "fileSize",
      upload_date as "uploadDate",
      uploaded_by as "uploadedBy",
      rows_processed as "rowsProcessed",
      status
    FROM excel_uploads
    WHERE id = $1
  `, [id]);

  if (result.rows.length === 0) return null;

  return result.rows[0];
}

