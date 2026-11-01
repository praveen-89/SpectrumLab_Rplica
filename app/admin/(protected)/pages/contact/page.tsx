import type { Metadata } from "next";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import ContactPageForm from "@/Admin/frontend/components/ContactPageForm";
import { updateContactPage } from "@/Admin/backend/actions/pages-actions";

export const metadata: Metadata = { title: "Contact Page" };

export default async function AdminContactPagePage() {
  const supabase = await createSupabaseServerClient();
  const { data: row, error } = await supabase.from("pages").select("data").eq("slug", "contact").single();
  if (error) throw new Error(error.message);

  const data = row.data as {
    mapEmbedUrl: string;
    administrator: { name: string; email: string; phone?: string };
    address: string[];
    body: string;
    collaborators: string;
  };

  return (
    <ContactPageForm
      initial={{
        mapEmbedUrl: data.mapEmbedUrl,
        administratorName: data.administrator.name,
        administratorEmail: data.administrator.email,
        administratorPhone: data.administrator.phone ?? "",
        address: data.address,
        body: data.body,
        collaborators: data.collaborators,
      }}
      updateAction={updateContactPage}
    />
  );
}
