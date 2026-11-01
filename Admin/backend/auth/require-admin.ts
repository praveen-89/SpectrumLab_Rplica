import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * The authorization gate for every /admin page and action. Supabase Auth
 * only proves *who* someone is (any email/password account can
 * authenticate) — this checks they're also the one allowlisted admin
 * row in admin_user, with is_active still true. Call this at the top of
 * every admin Server Component/layout and every admin Server Action;
 * never rely on the client-side UI alone to hide admin pages.
 */
export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) redirect("/admin/login");

  // Same is_admin() SQL function the RLS write policies use (see
  // supabase/migrations/001_init_schema.sql) — one definition of "is this
  // user the admin", called from both places instead of duplicated.
  const { data: isAdmin } = await supabase.rpc("is_admin");

  if (!isAdmin) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not-authorized");
  }

  return { email: user.email };
}
