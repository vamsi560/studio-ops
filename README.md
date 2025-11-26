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
   
   Open `src/ai/genkit.ts` and replace `YOUR_GOOGLE_AI_API_KEY_HERE` with your actual Google AI API key:
   ```typescript
   const GOOGLE_GENAI_API_KEY = 'your_actual_api_key_here';
   ```
   
   **Note:** The API key is currently hardcoded for development purposes. All keys are hardcoded and ready for Vercel deployment.

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

- All keys are already hardcoded:
  - ✅ Firebase configuration: `src/firebase/config.ts`
  - ✅ Google AI API key: `src/ai/genkit.ts`

### Deployment Steps

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Deploy to Vercel:**
   
   **Option A: Via Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Click "Deploy" (no environment variables needed - all keys are hardcoded)

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

- ✅ All API keys are hardcoded in the source code
- ✅ No environment variables need to be configured in Vercel
- ✅ The build script has been optimized for Vercel
- ✅ Firebase and Genkit configurations are ready for production

### Configuration Files

- `vercel.json` - Vercel deployment configuration
- `next.config.ts` - Next.js configuration optimized for Vercel
- `package.json` - Build scripts configured for Vercel
