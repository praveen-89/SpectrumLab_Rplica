import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import TalkForm from "@/Admin/frontend/components/TalkForm";
import { updateTalk, deleteTalk } from "@/Admin/backend/actions/talks-actions";

export const metadata: Metadata = { title: "Edit Talk" };

export default async function EditTalkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ kind?: string }>;
}) {
  const { id } = await params;
  const { kind: kindParam } = await searchParams;
  const kind = kindParam === "delivered" ? "delivered" : "organized";

  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase.from("talks").select("data").eq("id", id).eq("kind", kind).single();
  if (!row) notFound();

  const data = row.data as {
    slug: string;
    title: string;
    date: string;
    venue?: string;
    speakers?: Array<{ name: string }>;
    keywords?: string[];
    links?: { slides?: string; video?: string; url?: string };
    body?: string;
  };

  return (
    <TalkForm
      initial={{
        slug: data.slug,
        kind,
        title: data.title,
        date: data.date,
        venue: data.venue ?? "",
        speaker: data.speakers?.[0]?.name ?? "",
        slides: data.links?.slides ?? "",
        video: data.links?.video ?? "",
        eventUrl: data.links?.url ?? "",
        tags: (data.keywords ?? []).join(", "),
        abstract: data.body ?? "",
      }}
      updateAction={updateTalk.bind(null, id, kind)}
      deleteAction={deleteTalk.bind(null, id, kind)}
    />
  );
}
