"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import ToastContainer, { useToast } from "./Toast";

export type AdminFormResult = { error?: string } | void;

/**
 * Wraps a <form> with a title, a Save button (loading state while
 * pending), a Cancel link, and — in edit mode — a bottom Delete button
 * that confirms via ConfirmDialog first. `onSubmit`/`onDelete` do the
 * actual Server Action call and FormData assembly (each content type's
 * fields differ too much to generalize that part); this component only
 * owns the surrounding chrome, pending state, and toast feedback.
 */
export default function AdminForm({
  title,
  backHref,
  onSubmit,
  onDelete,
  deleteLabel = "Delete",
  children,
}: {
  title: string;
  backHref: string;
  onSubmit: () => Promise<AdminFormResult>;
  onDelete?: () => Promise<void>;
  deleteLabel?: string;
  children: React.ReactNode;
}) {
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const { toasts, showToast } = useToast();

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    startSave(async () => {
      const result = await onSubmit();
      if (result?.error) showToast(result.error, "error");
      else showToast("Saved.", "success");
    });
  }

  async function handleDelete() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed || !onDelete) return;
    startDelete(async () => {
      await onDelete();
    });
  }

  return (
    <div className="admin-card-surface">
      <h1>{title}</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        {children}
        <div className="admin-form-actions">
          <div className="admin-form-actions-main">
            <button type="submit" className="admin-btn admin-btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <Link href={backHref} className="admin-btn admin-btn-secondary">
              Cancel
            </Link>
          </div>
          {onDelete && (
            <button type="button" className="admin-btn admin-btn-danger-outline" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : deleteLabel}
            </button>
          )}
        </div>
      </form>
      {onDelete && <ConfirmDialog ref={confirmRef} message={`${deleteLabel}? This cannot be undone.`} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
