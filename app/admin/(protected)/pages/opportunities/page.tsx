import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import OpportunitiesPageForm from "@/Admin/frontend/components/OpportunitiesPageForm";
import { updateOpportunitiesPage } from "@/Admin/backend/actions/pages-actions";

export const metadata: Metadata = { title: "Opportunities Page" };

export default async function AdminOpportunitiesPagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("pages").select("data").eq("slug", "opportunities").single();
  if (error) throw new Error(error.message);

  const data = row.data as {
    body: string;
    requiredSkills: string[];
    applicationProcess: string;
    readyToApply: string;
    positions: unknown;
    additionalResources: unknown;
  };

  return (
    <OpportunitiesPageForm
      initial={{
        body: data.body,
        requiredSkills: data.requiredSkills,
        applicationProcess: data.applicationProcess,
        readyToApply: data.readyToApply,
        positionsJson: JSON.stringify(data.positions, null, 2),
        additionalResourcesJson: JSON.stringify(data.additionalResources, null, 2),
      }}
      updateAction={updateOpportunitiesPage}
    />
  );
}
