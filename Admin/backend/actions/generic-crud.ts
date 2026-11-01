import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/Admin/backend/auth/require-admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { z } from "zod";

// Shared write logic behind every content type's admin actions: parse +
// validate the submitted JSON against that type's real Zod schema (the
// same one the public site's readers already rely on), write it,
// audit-log it, and revalidate whichever public paths depend on it. Not
// itself a Server Action (no "use server") — Next.js requires each
// action to be a literal exported async function in a "use server" file,
// so every content type still has its own thin actions file that calls
// into this; this is just the part that would otherwise be copy-pasted
// into all of them.

export type JsonFormState = { error?: string };

function parseJson(jsonText: string): { data: unknown } | { error: string } {
  try {
    return { data: JSON.parse(jsonText) };
  } catch {
    return { error: "Invalid JSON." };
  }
}

function revalidateAll(paths: Array<string | [string, "layout" | "page"]>) {
  for (const path of paths) {
    if (Array.isArray(path)) revalidatePath(...path);
    else revalidatePath(path);
  }
}

type SupabaseServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function logAudit(
  supabase: SupabaseServerClient,
  adminEmail: string,
  action: "insert" | "update" | "delete",
  table: string,
  recordId: string,
  before: unknown,
  after: unknown,
) {
  await supabase.from("audit_log").insert({ admin_email: adminEmail, action, table_name: table, record_id: recordId, before, after });
}

/** Validates jsonText against schema, inserts {...extraColumns, data} into table, audit-logs it, revalidates. extraColumns may reference the validated data via a function. */
export async function genericCreate<Schema extends z.ZodType>(
  table: string,
  idColumn: string,
  schema: Schema,
  jsonText: string,
  extraColumns: (data: z.infer<Schema>) => Record<string, unknown>,
  revalidatePaths: Array<string | [string, "layout" | "page"]>,
): Promise<JsonFormState> {
  const { email } = await requireAdmin();
  const parsed = parseJson(jsonText);
  if ("error" in parsed) return parsed;

  const result = schema.safeParse(parsed.data);
  if (!result.success) return { error: result.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data: inserted, error } = await supabase
    .from(table)
    .insert({ ...extraColumns(result.data), data: result.data })
    .select(idColumn)
    .single();
  if (error) return { error: error.message };

  await logAudit(supabase, email, "insert", table, String((inserted as unknown as Record<string, unknown>)[idColumn]), null, result.data);
  revalidateAll(revalidatePaths);
  return {};
}

/** Validates jsonText against schema, updates the row matching idColumn=id, audit-logs it, revalidates. */
export async function genericUpdate<Schema extends z.ZodType>(
  table: string,
  idColumn: string,
  id: string,
  schema: Schema,
  jsonText: string,
  extraColumns: (data: z.infer<Schema>) => Record<string, unknown>,
  revalidatePaths: Array<string | [string, "layout" | "page"]>,
): Promise<JsonFormState> {
  const { email } = await requireAdmin();
  const parsed = parseJson(jsonText);
  if ("error" in parsed) return parsed;

  const result = schema.safeParse(parsed.data);
  if (!result.success) return { error: result.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from(table).select("data").eq(idColumn, id).single();

  const { error } = await supabase
    .from(table)
    .update({ ...extraColumns(result.data), data: result.data })
    .eq(idColumn, id);
  if (error) return { error: error.message };

  await logAudit(supabase, email, "update", table, id, existing?.data ?? null, result.data);
  revalidateAll(revalidatePaths);
  return {};
}

/** Deletes the row matching idColumn=id, audit-logs it, revalidates. */
export async function genericDelete(
  table: string,
  idColumn: string,
  id: string,
  revalidatePaths: Array<string | [string, "layout" | "page"]>,
): Promise<void> {
  const { email } = await requireAdmin();
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from(table).select("data").eq(idColumn, id).single();

  const { error } = await supabase.from(table).delete().eq(idColumn, id);
  if (error) throw new Error(error.message);

  await logAudit(supabase, email, "delete", table, id, existing?.data ?? null, null);
  revalidateAll(revalidatePaths);
}

/** Validates jsonText against schema, updates the single row matching idColumn=idValue (for singleton tables like pages/site_config), audit-logs it, revalidates. */
export async function genericUpdateSingleton<Schema extends z.ZodType>(
  table: string,
  idColumn: string,
  idValue: string,
  schema: Schema,
  jsonText: string,
  revalidatePaths: Array<string | [string, "layout" | "page"]>,
): Promise<JsonFormState> {
  const { email } = await requireAdmin();
  const parsed = parseJson(jsonText);
  if ("error" in parsed) return parsed;

  const result = schema.safeParse(parsed.data);
  if (!result.success) return { error: result.error.issues[0].message };

  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase.from(table).select("data").eq(idColumn, idValue).single();

  const { error } = await supabase.from(table).update({ data: result.data }).eq(idColumn, idValue);
  if (error) return { error: error.message };

  await logAudit(supabase, email, "update", table, idValue, existing?.data ?? null, result.data);
  revalidateAll(revalidatePaths);
  return {};
}
