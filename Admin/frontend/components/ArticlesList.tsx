"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSearch from "./AdminSearch";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteArticle } from "@/Admin/backend/actions/articles-actions";

export type ArticleRow = { id: string; title: string; date?: string };

function DeleteButton({ article }: { article: ArticleRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteArticle(article.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${article.title}"? This cannot be undone.`} />
    </>
  );
}

export default function ArticlesList({ articles }: { articles: ArticleRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = articles.filter((article) => article.title.toLowerCase().includes(query.toLowerCase()));

  const columns: AdminTableColumn<ArticleRow>[] = [
    { header: "Title", render: (article) => article.title },
    { header: "Date", render: (article) => article.date ?? "—" },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Articles</h1>
          <p>{articles.length} articles — long-form writeups.</p>
        </div>
        <Link href="/admin/articles/new" className="admin-btn admin-btn-primary">
          Add Article
        </Link>
      </div>
      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by title..." />
      </div>
      <AdminTable
        columns={columns}
        rows={filtered}
        rowKey={(article) => article.id}
        emptyLabel="articles"
        addHref="/admin/articles/new"
        actions={(article) => (
          <>
            <Link href={`/admin/articles/${article.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton article={article} />
          </>
        )}
      />
    </div>
  );
}
