"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

type UpdateAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

/** A single content row's editor: optional extra plain-field inputs (e.g. slug/group for people) plus a JSON textarea for everything else, save + delete. Used by every list-based content type's admin page. */
export default function JsonRow({
  label,
  initialJson,
  updateAction,
  deleteAction,
  extraFields,
}: {
  label: string;
  initialJson: string;
  updateAction: UpdateAction;
  deleteAction: () => Promise<void>;
  extraFields?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(updateAction, undefined);
  const [deleting, startDelete] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm(`Delete "${label}"? This can't be undone.`)) return;
    startDelete(async () => {
      await deleteAction();
      router.refresh();
    });
  }

  return (
    <div className="admin-json-row">
      <h3>{label}</h3>
      <form action={formAction}>
        {extraFields}
        <textarea name="json" defaultValue={initialJson} rows={10} />
        <div className="admin-json-row-actions">
          <button type="submit" disabled={pending}>
            {pending ? "Saving..." : "Save"}
          </button>
          <button type="button" disabled={deleting} onClick={handleDelete}>
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
        {state?.error && <p className="admin-login-error">{state.error}</p>}
      </form>
    </div>
  );
}
