import type { Metadata } from "next";
import ArticleForm from "@/Admin/frontend/components/ArticleForm";
import { createArticle } from "@/Admin/backend/actions/articles-actions";

export const metadata: Metadata = { title: "Add Article" };

export default function NewArticlePage() {
  return <ArticleForm createAction={createArticle} />;
}
