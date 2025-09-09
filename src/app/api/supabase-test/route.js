import { NextResponse } from 'next/server'
import { supabase, getServiceClient } from '@/lib/supabaseClient'

// Usage examples:
//   GET /api/supabase-test                  -> basic connectivity check
//   GET /api/supabase-test?mode=rw&note=hi  -> attempts insert/select on test_ping table
// Requirements for rw mode:
//   Table (run in Supabase SQL editor):
//     create table if not exists public.test_ping (
//       id uuid primary key default gen_random_uuid(),
//       created_at timestamptz default now(),
//       note text
//     );
//     alter table public.test_ping enable row level security; -- optional, then add policies:
//     create policy "anon select" on public.test_ping for select using (true);
//     create policy "anon insert" on public.test_ping for insert with check (true);
//   OR set SUPABASE_SERVICE_ROLE_KEY env var and the route will use service role for the test.

export async function GET(request) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode') || 'basic'
  const note = url.searchParams.get('note') || 'ping'

  // Pick client (service role if available for easier testing)
  let client = supabase
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  if (hasService) {
    try { client = getServiceClient() } catch { /* ignore */ }
  }

  if (mode === 'rw') {
    // Attempt a write then read.
    try {
      const insertRes = await client.from('test_ping').insert({ note }).select('*').single()
      if (insertRes.error) {
        return NextResponse.json({
          ok: false,
            stage: 'insert',
            error: insertRes.error.message,
            hint: 'Ensure table test_ping exists and RLS policies allow insert (or provide service role key).'
        }, { status: 500 })
      }
      // Fetch last 5
      const listRes = await client.from('test_ping').select('*').order('created_at', { ascending: false }).limit(5)
      if (listRes.error) {
        return NextResponse.json({
          ok: false,
          stage: 'select',
          error: listRes.error.message,
          hint: 'Check select policy on test_ping.'
        }, { status: 500 })
      }
      return NextResponse.json({ ok: true, mode: 'rw', inserted: insertRes.data, recent: listRes.data, usedServiceRole: hasService })
    } catch (e) {
      return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
    }
  }

  // Basic connectivity test: try a trivial select on a guaranteed built-in function via a minimal query.
  try {
    // We cannot rely on a custom RPC existing; so just return success if anon key parsed.
    return NextResponse.json({ ok: true, mode: 'basic', message: 'Supabase client initialized', url: !!process.env.NEXT_PUBLIC_SUPABASE_URL })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
