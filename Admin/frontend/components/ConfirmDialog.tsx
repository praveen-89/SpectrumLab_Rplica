"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";

export type ConfirmDialogHandle = { open: () => Promise<boolean> };

/**
 * A native <dialog> confirm prompt. Imperative (via ref) rather than
 * prop-driven open state, so callers can `await confirmRef.current.open()`
 * inline in a delete handler instead of juggling extra component state.
 */
const ConfirmDialog = forwardRef<ConfirmDialogHandle, { title?: string; message?: string }>(function ConfirmDialog(
  { title = "Are you sure?", message = "This cannot be undone." },
  ref,
) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolveRef = useRef<((confirmed: boolean) => void) | null>(null);

  useImperativeHandle(ref, () => ({
    open: () =>
      new Promise<boolean>((resolve) => {
        resolveRef.current = resolve;
        dialogRef.current?.showModal();
      }),
  }));

  function close(confirmed: boolean) {
    dialogRef.current?.close();
    resolveRef.current?.(confirmed);
    resolveRef.current = null;
  }

  return (
    <dialog ref={dialogRef} className="admin-dialog" onCancel={() => close(false)}>
      <div className="admin-dialog-body">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="admin-dialog-actions">
          <button type="button" className="admin-btn admin-btn-secondary" onClick={() => close(false)}>
            Cancel
          </button>
          <button type="button" className="admin-btn admin-btn-danger" onClick={() => close(true)}>
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
});

export default ConfirmDialog;
