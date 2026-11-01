import type { Metadata } from "next";
import PublicationForm from "@/Admin/frontend/components/PublicationForm";
import { createPublication } from "@/Admin/backend/actions/publications-actions";

export const metadata: Metadata = { title: "Add Publication" };

export default function NewPublicationPage() {
  return <PublicationForm createAction={createPublication} />;
}
