# Supabase SQL Migrations

This directory holds raw SQL migrations applied via the Supabase CLI (Option 1 approach).

## Prerequisites

1. Install CLI: https://supabase.com/docs/guides/cli
2. Login: `supabase login`
3. Link project: `supabase link --project-ref YOUR_PROJECT_REF`
4. Ensure `.env` has `SUPABASE_SERVICE_ROLE_KEY` (CLI reads from env when pushing, or you will be prompted).

## Apply Migrations

- Push latest migrations to remote:

```
supabase db push
```

- Diff local DB (after editing SQL) into a new migration file:

```
supabase db diff --file 20250908T_additions.sql
```

- Reset local shadow DB and reapply (dangerous – drops data):

```
supabase db reset
```

## Structure

- `migrations/<timestamp>_description.sql` — pure SQL; order determined lexicographically.

## Hardening TODO (before production)

- Replace dev-wide policies with ownership-based policies.
- Restrict inserts/updates to artist-owned rows.
- Add policies for audience inserts to `song_requests` only (no mass read of other tables if privacy desired).

## Rolling Back

Supabase CLI does not auto-generate down migrations. To rollback, create a new migration that reverses the change.

## Next Steps

1. Run `supabase db push` to create tables.
2. Replace dev RLS policies with proper ones (ask for a policy template when ready).
3. Implement data access layer (server actions or routes) using the new tables.
