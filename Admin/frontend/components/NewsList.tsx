"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSearch from "./AdminSearch";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteNews } from "@/Admin/backend/actions/news-actions";

export type NewsRow = { id: string; date: string; category?: string; title: string; hasDetailPage: boolean };

function DeleteButton({ item }: { item: NewsRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteNews(item.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${item.title}"? This cannot be undone.`} />
    </>
  );
}

export default function NewsList({ items }: { items: NewsRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()));

  const columns: AdminTableColumn<NewsRow>[] = [
    { header: "Date", render: (item) => item.date },
    { header: "Category", render: (item) => (item.category ? <AdminBadge color="blue">{item.category}</AdminBadge> : "—") },
    { header: "Title", render: (item) => item.title },
    { header: "Has detail page", render: (item) => (item.hasDetailPage ? "✓" : "—") },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>News</h1>
          <p>{items.length} news items — feed and home page highlights, newest first.</p>
        </div>
        <Link href="/admin/news/new" className="admin-btn admin-btn-primary">
          Add News
        </Link>
      </div>

      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by title..." />
      </div>

      <AdminTable
        columns={columns}
        rows={filtered}
        rowKey={(item) => item.id}
        emptyLabel="news items"
        addHref="/admin/news/new"
        actions={(item) => (
          <>
            <Link href={`/admin/news/${item.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton item={item} />
          </>
        )}
      />
    </div>
  );
}
