"use client";

import { useActionState } from "react";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

type UpdateAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

/** Editor for a fixed, singleton row (pages/site_config) — no create or delete, just save. */
export default function SingletonEditor({ initialJson, updateAction }: { initialJson: string; updateAction: UpdateAction }) {
  const [state, formAction, pending] = useActionState(updateAction, undefined);

  return (
    <form action={formAction} className="admin-json-row">
      <textarea name="json" defaultValue={initialJson} rows={16} />
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
      {state?.error && <p className="admin-login-error">{state.error}</p>}
    </form>
  );
}
