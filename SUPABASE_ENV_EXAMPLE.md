# Supabase Environment Variables

Copy these into your local `.env.local` (never commit real secrets):

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # server-only, DO NOT expose to client
```

Add `.env.local` to `.gitignore` if not already.
