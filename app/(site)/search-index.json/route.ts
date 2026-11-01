import { NextResponse } from "next/server";
import { buildSearchIndex } from "@/lib/search";

// Pre-rendered at build time (works under `next build` with static export
// too) rather than computed per-request — the index only changes when
// content does.
export const dynamic = "force-static";

export async function GET() {
  const items = await buildSearchIndex();
  return NextResponse.json(items);
}
