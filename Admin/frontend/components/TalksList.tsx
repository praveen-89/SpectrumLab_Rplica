"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteTalk } from "@/Admin/backend/actions/talks-actions";

export type TalkRow = { id: string; kind: "organized" | "delivered"; date: string; title: string; venue?: string };

function DeleteButton({ talk }: { talk: TalkRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteTalk(talk.id, talk.kind);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${talk.title}"? This cannot be undone.`} />
    </>
  );
}

export default function TalksList({ organized, delivered }: { organized: TalkRow[]; delivered: TalkRow[] }) {
  const [tab, setTab] = useState<"organized" | "delivered">("organized");
  const rows = tab === "organized" ? organized : delivered;

  const columns: AdminTableColumn<TalkRow>[] = [
    { header: "Date", render: (talk) => talk.date },
    { header: "Title", render: (talk) => talk.title },
    { header: "Venue", render: (talk) => (talk.venue && talk.venue.length > 40 ? `${talk.venue.slice(0, 40)}...` : talk.venue ?? "—") },
    { header: "Type", render: (talk) => <AdminBadge>{talk.kind}</AdminBadge> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Talks</h1>
          <p>Organized and delivered talks.</p>
        </div>
        <Link href="/admin/talks/new" className="admin-btn admin-btn-primary">
          Add Talk
        </Link>
      </div>

      <div className="admin-tabs">
        <button type="button" className={`admin-tab ${tab === "organized" ? "active" : ""}`} onClick={() => setTab("organized")}>
          Organized ({organized.length})
        </button>
        <button type="button" className={`admin-tab ${tab === "delivered" ? "active" : ""}`} onClick={() => setTab("delivered")}>
          Delivered ({delivered.length})
        </button>
      </div>

      <AdminTable
        columns={columns}
        rows={rows}
        rowKey={(talk) => talk.id}
        emptyLabel="talks"
        addHref="/admin/talks/new"
        actions={(talk) => (
          <>
            <Link href={`/admin/talks/${talk.id}/edit?kind=${talk.kind}`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton talk={talk} />
          </>
        )}
      />
    </div>
  );
}
