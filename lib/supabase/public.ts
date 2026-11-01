import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Plain anon-key Supabase client for the public site's content reads.
 * Deliberately NOT bound to request cookies (unlike
 * lib/supabase/server.ts) — content tables are readable by anyone per
 * their "public read" RLS policy, so there's no session to scope to,
 * and avoiding cookies() here means these reads don't force a route
 * into fully dynamic rendering just to look up a cookie they never use.
 */
export const supabasePublic = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false },
});
