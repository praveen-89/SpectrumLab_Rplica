import type { Metadata } from "next";
import PersonForm from "@/Admin/frontend/components/PersonForm";
import { createPerson } from "@/Admin/backend/actions/people-actions";

export const metadata: Metadata = { title: "Add Person" };

export default function NewPersonPage() {
  return <PersonForm createAction={createPerson} />;
}
