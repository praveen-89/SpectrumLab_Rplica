import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase client bound to the current request's auth cookies — respects
 * Row Level Security as whichever user is logged in (or anonymous). Used
 * by the admin portal's server actions/route handlers for anything that
 * should be scoped to the logged-in admin's session, and by the public
 * site's content readers for anonymous, RLS-restricted reads.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component where cookies can't be written
          // (e.g. during static rendering) — middleware refreshes the
          // session on the next request instead, so this is safe to ignore.
        }
      },
    },
  });
}
