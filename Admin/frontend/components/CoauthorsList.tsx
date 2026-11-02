"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSearch from "./AdminSearch";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteCoauthor } from "@/Admin/backend/actions/coauthors-actions";

export type CoauthorRow = { id: string; nameKey: string; href: string };

function DeleteButton({ coauthor }: { coauthor: CoauthorRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteCoauthor(coauthor.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${coauthor.nameKey}"? This cannot be undone.`} />
    </>
  );
}

export default function CoauthorsList({ coauthors }: { coauthors: CoauthorRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = coauthors.filter((c) => c.nameKey.toLowerCase().includes(query.toLowerCase()));

  const columns: AdminTableColumn<CoauthorRow>[] = [
    { header: "Name", render: (c) => c.nameKey },
    { header: "Profile URL", render: (c) => c.href },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Coauthors</h1>
          <p>{coauthors.length} coauthors — maps an author name variant to a /people/ profile URL.</p>
        </div>
        <Link href="/admin/coauthors/new" className="admin-btn admin-btn-primary">
          Add Coauthor
        </Link>
      </div>
      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by name..." />
      </div>
      <AdminTable
        columns={columns}
        rows={filtered}
        rowKey={(c) => c.id}
        emptyLabel="coauthors"
        addHref="/admin/coauthors/new"
        actions={(c) => (
          <>
            <Link href={`/admin/coauthors/${c.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton coauthor={c} />
          </>
        )}
      />
    </div>
  );
}
