import type { Metadata } from "next";
import GrantForm from "@/Admin/frontend/components/GrantForm";
import { createGrant } from "@/Admin/backend/actions/grants-actions";

export const metadata: Metadata = { title: "Add Grant" };

export default function NewGrantPage() {
  return <GrantForm createAction={createGrant} />;
}
