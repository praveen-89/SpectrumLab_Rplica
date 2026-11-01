import type { Metadata } from "next";
import RecognitionForm from "@/Admin/frontend/components/RecognitionForm";
import { createRecognition } from "@/Admin/backend/actions/recognition-actions";

export const metadata: Metadata = { title: "Add Recognition" };

export default function NewRecognitionPage() {
  return <RecognitionForm createAction={createRecognition} />;
}
