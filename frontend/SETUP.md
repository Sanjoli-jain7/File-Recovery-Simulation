# File Recovery Tool - Setup Guide

## Architecture Overview

This application uses:
- **Frontend**: React with TypeScript
- **Backend**: Supabase Edge Functions (serverless)
- **Database**: Supabase PostgreSQL

## Setup Instructions

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Supabase Credentials

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings > API**
   - Copy the **Project URL** and **Anon Key**

3. Update `.env` with your credentials:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

### Step 4: Start the Development Server

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## How the Application Works

The frontend communicates with Supabase Edge Functions:

```
┌─────────────────────────────┐
│   React Frontend            │
│   (Your local machine)      │
└──────────────┬──────────────┘
               │ HTTPS Requests
               ▼
┌─────────────────────────────┐
│   Supabase Edge Functions   │
│   (Serverless backend)      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Supabase Database         │
│   (PostgreSQL)              │
└─────────────────────────────┘
```

### API Endpoints

1. **POST /functions/v1/file-recovery** - Start file recovery
   - Sends: `{ "drive": "C:" }`
   - Returns: `{ "status": "success", "message": "..." }`

2. **GET /functions/v1/recovered-files** - Get list of recovered files
   - Returns: `{ "files": ["file1", "file2", ...] }`

## Troubleshooting

### "Backend Disconnected" Message

If you see this message:

1. **Check your `.env` file exists** and has the correct values:
   ```bash
   cat .env
   ```

2. **Verify Supabase credentials** are correct:
   - Go to your Supabase project dashboard
   - Check **Settings > API** for the correct URL and key

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. **Check browser console** for detailed error messages (F12 or Ctrl+Shift+I)

### Build Issues

```bash
npm run build
```

If the build fails, check that all dependencies are installed:
```bash
npm install
```

## Key Files

- `src/App.tsx` - Main UI component
- `src/services/api.ts` - Supabase API client
- `src/components/FilesList.tsx` - Displays recovered files
- `supabase/functions/` - Edge Function implementations

## Production Deployment

1. Build the frontend:
   ```bash
   npm run build
   ```

2. Deploy to a static hosting service:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

3. Ensure your Supabase Edge Functions are deployed (they are automatically deployed when added to `supabase/functions/`)

## Support

For issues with:
- **Supabase**: Visit [Supabase Docs](https://supabase.com/docs)
- **React**: Visit [React Docs](https://react.dev)
- **Vite**: Visit [Vite Docs](https://vitejs.dev)
