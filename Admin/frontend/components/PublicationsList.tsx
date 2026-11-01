"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSearch from "./AdminSearch";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deletePublication } from "@/Admin/backend/actions/publications-actions";

export type PublicationRow = { key: string; year: number; title: string; authors: string[]; type: string };

function DeleteButton({ pub }: { pub: PublicationRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deletePublication(pub.key);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${pub.title}"? This cannot be undone.`} />
    </>
  );
}

export default function PublicationsList({ publications }: { publications: PublicationRow[] }) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const years = useMemo(() => Array.from(new Set(publications.map((p) => p.year))).sort((a, b) => b - a), [publications]);
  const types = useMemo(() => Array.from(new Set(publications.map((p) => p.type))).sort(), [publications]);

  const filtered = publications.filter((pub) => {
    const haystack = `${pub.title} ${pub.authors.join(" ")}`.toLowerCase();
    if (query && !haystack.includes(query.toLowerCase())) return false;
    if (typeFilter && pub.type !== typeFilter) return false;
    if (yearFilter && String(pub.year) !== yearFilter) return false;
    return true;
  });

  const columns: AdminTableColumn<PublicationRow>[] = [
    { header: "Year", render: (pub) => pub.year },
    {
      header: "Title",
      render: (pub) => (pub.title.length > 60 ? `${pub.title.slice(0, 60)}...` : pub.title),
    },
    {
      header: "Authors",
      render: (pub) => (pub.authors.length > 2 ? `${pub.authors.slice(0, 2).join(", ")}...` : pub.authors.join(", ")),
    },
    { header: "Type", render: (pub) => <AdminBadge>{pub.type}</AdminBadge> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Publications</h1>
          <p>Papers, BibTeX, abstracts.</p>
        </div>
        <Link href="/admin/publications/new" className="admin-btn admin-btn-primary">
          Add Publication
        </Link>
      </div>

      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by title or author..." />
        <select className="admin-filter-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {types.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select className="admin-filter-select" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All years</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      <AdminTable
        columns={columns}
        rows={filtered}
        rowKey={(pub) => pub.key}
        emptyLabel="publications"
        addHref="/admin/publications/new"
        actions={(pub) => (
          <>
            <Link href={`/admin/publications/${pub.key}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton pub={pub} />
          </>
        )}
      />
    </div>
  );
}
