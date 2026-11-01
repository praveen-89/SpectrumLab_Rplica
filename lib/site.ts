import "server-only";
import { supabasePublic } from "./supabase/public";

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  social: {
    email: string;
    googleScholarUrl: string;
    githubUrl: string;
    twitterUrl: string;
    twitterHandle: string;
  };
};

/** Site-wide settings — read from Supabase's site_config table (admin-managed equivalent of the old data/site.json). */
export async function getSite(): Promise<SiteConfig> {
  const { data: row, error } = await supabasePublic.from("site_config").select("data").eq("key", "site").single();
  if (error) throw new Error(`Failed to read site config from Supabase: ${error.message}`);
  return row.data as SiteConfig;
}
