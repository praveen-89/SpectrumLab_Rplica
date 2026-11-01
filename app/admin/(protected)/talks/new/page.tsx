import type { Metadata } from "next";
import TalkForm from "@/Admin/frontend/components/TalkForm";
import { createTalk } from "@/Admin/backend/actions/talks-actions";

export const metadata: Metadata = { title: "Add Talk" };

export default function NewTalkPage() {
  return <TalkForm createAction={createTalk} />;
}
