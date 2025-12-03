# Firebase Studio

This is a NextJS starter in Firebase Studio.

## Local Development Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Google AI API key:**
   
   The app uses the `GOOGLE_GENAI_API_KEY` environment variable. For local development:
   
   - Create a `.env.local` file in the root directory:
     ```bash
     GOOGLE_GENAI_API_KEY=your_google_ai_api_key_here
     ```
   
   **Note:** 
   - In Vercel, the API key must be set as an environment variable in project settings
   - Get a new API key from [Google AI Studio](https://aistudio.google.com/app/apikey) if needed
   - Test your API key setup by visiting: `https://your-app.vercel.app/api/test-api-key`

### Running the Application

1. **Start the Next.js development server:**
   ```bash
   npm run dev
   ```
   
   This will start the app on **http://localhost:9002** (port 9002 as configured)

2. **Start Genkit AI server (optional, if using AI features):**
   
   In a separate terminal window:
   ```bash
   npm run genkit:dev
   ```
   
   Or for watch mode (auto-reload on changes):
   ```bash
   npm run genkit:watch
   ```

### Available Scripts

- `npm run dev` - Start Next.js development server with Turbopack on port 9002
- `npm run genkit:dev` - Start Genkit AI server
- `npm run genkit:watch` - Start Genkit AI server in watch mode
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Firebase Configuration

Firebase is already configured in `src/firebase/config.ts`. The project is connected to:
- Project ID: `studio-4150661008-f4ae8`

### Project Structure

- `src/app/` - Next.js app directory (pages and layouts)
- `src/components/` - React components
- `src/firebase/` - Firebase configuration and utilities
- `src/ai/` - Genkit AI flows and configuration
- `src/lib/` - Utility functions and types

### Getting Started

To get started, take a look at `src/app/page.tsx`.

## Vercel Deployment

This project is configured for deployment to Vercel with all API keys hardcoded.

### Prerequisites for Deployment

- Environment variables configured in Vercel:
  - ✅ `GOOGLE_GENAI_API_KEY` - Set in Vercel project settings
- Firebase configuration is hardcoded in `src/firebase/config.ts`

### Deployment Steps

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Configure Environment Variables in Vercel:**
   
   - Go to your project settings in Vercel Dashboard
   - Navigate to "Environment Variables"
   - Add the following variable:
     - Name: `GOOGLE_GENAI_API_KEY`
     - Value: Your Google AI API key
     - Environment: Production, Preview, and Development (select all)

3. **Deploy to Vercel:**
   
   **Option A: Via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project" (or open existing project)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Make sure environment variables are set (see step 2)
   - Click "Deploy"

   **Option B: Via Vercel CLI**
   ```bash
   npm i -g vercel
   vercel
   ```
   Follow the prompts and deploy.

3. **Verify Deployment:**
   - After deployment, Vercel will provide you with a URL
   - Visit the URL to verify the app is running
   - Check that Firebase and Genkit features are working

### Important Notes

- ✅ `GOOGLE_GENAI_API_KEY` must be set as an environment variable in Vercel (required for all environments)
- ✅ Firebase configuration is hardcoded in `src/firebase/config.ts`
- ✅ The build script has been optimized for Vercel
- ✅ For local development, use `.env.local` file
- ✅ Test API key configuration: Visit `/api/test-api-key` endpoint after deployment
- ⚠️ **Important:** After setting/updating environment variables in Vercel, you must trigger a new deployment for changes to take effect

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `next.config.ts` - Next.js configuration optimized for Vercel
- `package.json` - Build scripts configured for Vercel
