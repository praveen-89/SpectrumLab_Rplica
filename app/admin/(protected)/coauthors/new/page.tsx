import type { Metadata } from "next";
import CoauthorForm from "@/Admin/frontend/components/CoauthorForm";
import { createCoauthor } from "@/Admin/backend/actions/coauthors-actions";

export const metadata: Metadata = { title: "Add Coauthor" };

export default function NewCoauthorPage() {
  return <CoauthorForm createAction={createCoauthor} />;
}
