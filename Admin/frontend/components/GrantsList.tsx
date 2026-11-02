"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteGrant } from "@/Admin/backend/actions/grants-actions";

export type GrantRow = { id: string; title: string; institution: string; startYear: number; endYear?: number };

function DeleteButton({ grant }: { grant: GrantRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteGrant(grant.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${grant.title}"? This cannot be undone.`} />
    </>
  );
}

export default function GrantsList({ grants }: { grants: GrantRow[] }) {
  const columns: AdminTableColumn<GrantRow>[] = [
    { header: "Title", render: (grant) => grant.title },
    { header: "Institution", render: (grant) => grant.institution },
    { header: "Years", render: (grant) => `${grant.startYear}${grant.endYear ? `–${grant.endYear}` : "–present"}` },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Grants</h1>
          <p>{grants.length} funded projects, shown on the Funding page.</p>
        </div>
        <Link href="/admin/grants/new" className="admin-btn admin-btn-primary">
          Add Grant
        </Link>
      </div>
      <AdminTable
        columns={columns}
        rows={grants}
        rowKey={(grant) => grant.id}
        emptyLabel="grants"
        addHref="/admin/grants/new"
        actions={(grant) => (
          <>
            <Link href={`/admin/grants/${grant.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton grant={grant} />
          </>
        )}
      />
    </div>
  );
}
