"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteRecognition } from "@/Admin/backend/actions/recognition-actions";

export type RecognitionRow = { id: string; title: string; year?: string; type: string };

function DeleteButton({ item }: { item: RecognitionRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteRecognition(item.id);
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

export default function RecognitionList({ items }: { items: RecognitionRow[] }) {
  const columns: AdminTableColumn<RecognitionRow>[] = [
    { header: "Year", render: (item) => item.year ?? "—" },
    { header: "Title", render: (item) => item.title },
    { header: "Type", render: (item) => <AdminBadge>{item.type}</AdminBadge> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Recognition</h1>
          <p>Awards and honors.</p>
        </div>
        <Link href="/admin/recognition/new" className="admin-btn admin-btn-primary">
          Add Recognition
        </Link>
      </div>
      <AdminTable
        columns={columns}
        rows={items}
        rowKey={(item) => item.id}
        emptyLabel="recognition entries"
        addHref="/admin/recognition/new"
        actions={(item) => (
          <>
            <Link href={`/admin/recognition/${item.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton item={item} />
          </>
        )}
      />
    </div>
  );
}
