# Database Setup Instructions

## Creating Tables in PostgreSQL Database

You have two options to create the database tables:

### Option 1: Run SQL Script Directly (Recommended)

1. **Connect to your Retool PostgreSQL database** using any PostgreSQL client:
   - pgAdmin
   - DBeaver
   - psql command line
   - Or use Retool's database interface

2. **Connection Details:**
   ```
   Host: ep-round-breeze-af1fyksh.c-2.us-west-2.retooldb.com
   Database: retool
   Username: retool
   Password: npg_UWqxdlf1LmS7
   Port: 5432 (default)
   SSL: Required
   ```

3. **Run the SQL script:**
   - Open the file `database-init.sql` in this project
   - Copy the entire contents
   - Paste and execute it in your PostgreSQL client
   - Or run via command line:
     ```bash
     psql "postgresql://retool:npg_UWqxdlf1LmS7@ep-round-breeze-af1fyksh.c-2.us-west-2.retooldb.com/retool?sslmode=require" -f database-init.sql
     ```

### Option 2: Run Node.js Script (Easiest)

Simply run this command in your project directory:

```bash
npm run db:init
```

This will:
- Connect to the database
- Create all required tables
- Verify tables were created
- Show you which tables exist

### Option 3: Use the API Endpoint (After Deployment)

1. **Deploy your application to Vercel**

2. **Visit the initialization page:**
   ```
   https://your-app.vercel.app/init-db
   ```
   Click "Initialize Database Tables"

3. **Or call the API directly:**
   ```bash
   curl -X POST https://your-app.vercel.app/api/init-db
   ```

## Tables Created

1. **resources** - Main resource data table
2. **excel_uploads** - Upload metadata
3. **dashboard_metrics** - Cached dashboard metrics

## Verify Tables

After creating tables, you can verify they exist by running:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('resources', 'excel_uploads', 'dashboard_metrics')
ORDER BY table_name;
```

## Quick Test

After tables are created, test the connection:
```
https://your-app.vercel.app/api/db-test
```

This should return:
- Connection status: OK
- List of tables found
- Current database time

