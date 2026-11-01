import type { Metadata } from "next";
import FunderForm from "@/Admin/frontend/components/FunderForm";
import { createFunder } from "@/Admin/backend/actions/funders-actions";

export const metadata: Metadata = { title: "Add Funder" };

export default function NewFunderPage() {
  return <FunderForm createAction={createFunder} />;
}
