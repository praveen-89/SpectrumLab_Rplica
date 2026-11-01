// Recomputes publications.bib_order directly from content/papers.bib,
// standalone — doesn't go through lib/content/publications.ts, which is
// Supabase-backed and would just read back what's already in Supabase.
// Only needed if bib_order ever needs to be recomputed after an admin
// portal re-import of papers.bib.
//
// Run with: npx tsx --env-file=.env.local scripts/backfill-bib-order.mts
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parse } from "@retorquere/bibtex-parser/js";
import { createClient } from "@supabase/supabase-js";

const raw = await readFile(join(process.cwd(), "content", "papers.bib"), "utf-8");
const { entries } = parse(raw, { verbatimFields: ["abstract"], sentenceCase: false });

const withYear = entries.map((e) => ({ key: e.key, year: Number(e.fields.year) || 0 }));
const sorted = withYear
  .map((e, i) => ({ ...e, originalIndex: i }))
  .sort((a, b) => b.year - a.year); // stable sort, ties keep file order

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

for (let i = 0; i < sorted.length; i++) {
  const { error } = await supabase.from("publications").update({ bib_order: i }).eq("key", sorted[i].key);
  if (error) console.error(`Failed for ${sorted[i].key}:`, error.message);
}
console.log(`Backfilled bib_order for ${sorted.length} publications.`);
