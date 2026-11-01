"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { funderSchema } from "@/lib/content/schemas";

// Funders are shown on both the Funding page and the home page's
// carousel — both need revalidating whenever they change.
const AFFECTED_PATHS = ["/funding/", "/"];

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function logAudit(
  supabase: SupabaseServerClient,
  adminEmail: string,
  action: "insert" | "update" | "delete",
  recordId: string,
  before: unknown,
  after: unknown,
) {
  await supabase.from("audit_log").insert({
    admin_email: adminEmail,
    action,
    table_name: "funders",
    record_id: recordId,
    before,
    after,
  });
}

export type FunderFormState = { error?: string };

function parseFunderForm(formData: FormData) {
  return funderSchema.safeParse({
    name: formData.get("name"),
    logo: formData.get("logo"),
    url: formData.get("url") || undefined,
  });
}

export async function createFunder(_prevState: FunderFormState | undefined, formData: FormData): Promise<FunderFormState> {
  const { email } = await requireAdmin();
  const parsed = parseFunderForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data: maxRow } = await supabase.from("funders").select("sort_order").order("sort_order", { ascending: false }).limit(1).maybeSingle();
  const sortOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data: inserted, error } = await supabase.from("funders").insert({ data: parsed.data, sort_order: sortOrder }).select("id").single();
  if (error) return { error: error.message };

  await logAudit(supabase, email, "insert", inserted.id, null, parsed.data);
  for (const path of AFFECTED_PATHS) revalidatePath(path);
  return {};
}

export async function updateFunder(
  id: string,
  _prevState: FunderFormState | undefined,
  formData: FormData,
): Promise<FunderFormState> {
  const { email } = await requireAdmin();
  const parsed = parseFunderForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from("funders").select("data").eq("id", id).single();

  const { error } = await supabase.from("funders").update({ data: parsed.data }).eq("id", id);
  if (error) return { error: error.message };

  await logAudit(supabase, email, "update", id, existing?.data ?? null, parsed.data);
  for (const path of AFFECTED_PATHS) revalidatePath(path);
  return {};
}

export async function deleteFunder(id: string): Promise<void> {
  const { email } = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from("funders").select("data").eq("id", id).single();

  const { error } = await supabase.from("funders").delete().eq("id", id);
  if (error) throw new Error(error.message);

  await logAudit(supabase, email, "delete", id, existing?.data ?? null, null);
  for (const path of AFFECTED_PATHS) revalidatePath(path);
}
