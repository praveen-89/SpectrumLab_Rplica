import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import SiteSettingsForm from "@/Admin/frontend/components/SiteSettingsForm";
import { updateSiteConfig } from "@/Admin/backend/actions/site-config-actions";

export const metadata: Metadata = { title: "Site Settings" };

export default async function AdminSiteConfigPage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("site_config").select("data").eq("key", "site").single();
  if (error) throw new Error(error.message);

  const data = row.data as {
    name: string;
    description: string;
    url: string;
    social: { email: string; googleScholarUrl: string; githubUrl: string; twitterUrl: string; twitterHandle: string };
  };

  return (
    <div>
      <p className="admin-page-header" style={{ color: "var(--admin-danger)", fontWeight: 600 }}>
        Caution: this controls site-wide metadata and social links used across every page.
      </p>
      <SiteSettingsForm
        initial={{
          name: data.name,
          description: data.description,
          url: data.url,
          email: data.social.email,
          googleScholarUrl: data.social.googleScholarUrl,
          githubUrl: data.social.githubUrl,
          twitterUrl: data.social.twitterUrl,
          twitterHandle: data.social.twitterHandle,
        }}
        updateAction={updateSiteConfig}
      />
    </div>
  );
}
