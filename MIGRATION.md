# Database Migration: Firestore to PostgreSQL

This document outlines the migration from Firestore to PostgreSQL (Retool Database).

## Migration Overview

We've migrated from Firebase Firestore to PostgreSQL to avoid authentication issues and simplify the data layer.

## What Changed

### 1. Database Layer
- **Old**: Firebase Firestore with Firestore rules and anonymous authentication
- **New**: PostgreSQL (Retool Database) with direct connection

### 2. Data Access
- **Old**: Firestore hooks (`useCollection`, `useDoc`) with real-time listeners
- **New**: REST API routes + React hooks (`useResources`) with fetch-based data loading

### 3. Authentication
- **Old**: Firebase Anonymous Authentication required
- **New**: No authentication required for database access (can be added later if needed)

## Database Schema

### Tables Created

1. **resources** - Main resource data
   - id (SERIAL PRIMARY KEY)
   - vamid (VARCHAR, UNIQUE)
   - name, joining_date, grade, skills, etc.
   - created_at, updated_at timestamps

2. **excel_uploads** - Upload metadata
   - id, file_name, upload_date, status, etc.

3. **dashboard_metrics** - Cached dashboard metrics
   - id, total_bench, on_bench_90_plus, etc.

## Setup Instructions

### 1. Database Connection

The database connection string is **hardcoded** in `src/lib/db/config.ts` for simplicity:

```typescript
const connectionString = 'postgresql://retool:npg_UWqxdlf1LmS7@ep-round-breeze-af1fyksh.c-2.us-west-2.retooldb.com/retool?sslmode=require';
```

No environment variables needed!

### 2. Initialize Database

Run the initialization script to create tables:

```bash
npm run db:init
```

Or manually call the API endpoint after deployment:

```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

### 3. Components Updated

- ✅ `src/components/dashboard-page.tsx` - Now uses PostgreSQL
- ⏳ Other components still need migration (resources page, etc.)

## Next Steps

1. **Initialize the database** - Run `npm run db:init` or call `/api/init-db`
2. **Test the dashboard** - Verify data loads correctly
3. **Migrate remaining components** - Update other pages to use PostgreSQL
4. **Optional: Remove Firebase** - Once everything is migrated, we can remove Firebase dependencies

## Files Created

- `src/lib/db/config.ts` - Database connection configuration
- `src/lib/db/init.ts` - Database initialization
- `src/lib/db/queries/resources.ts` - Resource queries
- `src/lib/db/hooks/use-resources.ts` - React hook for resources
- `src/app/api/resources/route.ts` - API route for resources
- `src/app/api/init-db/route.ts` - Database initialization endpoint
- `src/app/actions/resources.ts` - Server actions for resources
- `scripts/init-db.ts` - Database initialization script

## Testing

1. Start the development server: `npm run dev`
2. Initialize database: `npm run db:init`
3. Visit http://localhost:9002
4. Check browser console for any errors
5. Verify resources load on the dashboard

