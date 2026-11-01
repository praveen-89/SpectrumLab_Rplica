import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client — bypasses Row Level Security entirely.
 * Server-only (the "server-only" import makes any accidental client
 * bundle reference a build error). Used by the admin backend's write
 * actions (after the allowlist check has already run) and by the
 * one-time content migration script. Never pass this client's result
 * to a Client Component or expose SUPABASE_SERVICE_ROLE_KEY to the browser.
 */
export function createSupabaseAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
