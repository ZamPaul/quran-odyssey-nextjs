# Local dev against the PRODUCTION Clerk instance

The production Clerk keys are tied to `quranodyssey.com`, so they refuse
`localhost:3000`. To test locally against real data (the clerkIds that match
Supabase), serve the app from a **subdomain over HTTPS on port 443**.

## One-time setup
1. Add to `C:\Windows\System32\drivers\etc\hosts` (edit as Administrator):
   ```
   127.0.0.1  local.quranodyssey.com
   ```
2. Install Caddy (https://caddyserver.com/docs/install) and trust its local CA:
   ```
   caddy trust
   ```

## `client/.env.local`
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_API_URL=https://local.quranodyssey.com
NEXT_PUBLIC_SUPABASE_URL=<prod supabase url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod supabase anon key>
```
The server keeps its existing `.env` (prod Supabase + prod `sk_live` so the
tokens verify and the data matches).

## Run (three terminals)
1. `cd server && npm run dev`         # API on :3001 (prod data)
2. `cd client && npm run dev`         # Next on :3000
3. `caddy run --config dev-proxy/Caddyfile`   # HTTPS :443 (run as Administrator)

Open **https://local.quranodyssey.com** — Clerk now accepts it.

## Known limits (Clerk, expected)
- Google/OAuth sign-in won't work on the local subdomain (providers pin
  redirect URLs to the real domain). Use an email/password test account.
- Clerk webhooks won't reach localhost.
- This is Clerk-"discouraged" but is their documented way to debug against
  production data. Don't ship it — it's a local convenience only.
