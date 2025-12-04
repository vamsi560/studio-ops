import { pool } from '../src/lib/db/config';

async function checkTables() {
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('\n=== Existing Tables in Database ===\n');
    result.rows.forEach((row: any, index: number) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Get column info for each table
    for (const row of result.rows) {
      const tableName = row.table_name;
      const columns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [tableName]);
      
      console.log(`\n--- Table: ${tableName} ---`);
      columns.rows.forEach((col: any) => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '[nullable]' : '[required]'}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    console.error('Error checking database:', error);
    await pool.end();
    process.exit(1);
  }
}

checkTables();

