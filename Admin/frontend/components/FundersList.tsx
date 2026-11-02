"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteFunder } from "@/Admin/backend/actions/funders-actions";

export type FunderRow = { id: string; name: string; logo: string };

function DeleteButton({ funder }: { funder: FunderRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteFunder(funder.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${funder.name}"? This cannot be undone.`} />
    </>
  );
}

export default function FundersList({ funders }: { funders: FunderRow[] }) {
  const columns: AdminTableColumn<FunderRow>[] = [
    {
      header: "Logo",
      render: (funder) =>
        // eslint-disable-next-line @next/next/no-img-element
        funder.logo ? <img src={funder.logo} alt="" style={{ width: 40, height: 40, objectFit: "contain" }} /> : "—",
    },
    { header: "Name", render: (funder) => funder.name },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Funders</h1>
          <p>{funders.length} funders — shown on the Funding page and the home page&apos;s carousel.</p>
        </div>
        <Link href="/admin/funders/new" className="admin-btn admin-btn-primary">
          Add Funder
        </Link>
      </div>
      <AdminTable
        columns={columns}
        rows={funders}
        rowKey={(funder) => funder.id}
        emptyLabel="funders"
        addHref="/admin/funders/new"
        actions={(funder) => (
          <>
            <Link href={`/admin/funders/${funder.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton funder={funder} />
          </>
        )}
      />
    </div>
  );
}
