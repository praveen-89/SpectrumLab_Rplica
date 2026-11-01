import type { Metadata } from "next";
import NewsForm from "@/Admin/frontend/components/NewsForm";
import { createNews } from "@/Admin/backend/actions/news-actions";

export const metadata: Metadata = { title: "Add News" };

export default function NewNewsPage() {
  return <NewsForm createAction={createNews} />;
}
