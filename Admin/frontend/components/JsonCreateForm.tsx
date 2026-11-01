"use client";

import { useActionState, useEffect, useRef } from "react";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

type CreateAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

/** The "add new" counterpart to JsonRow — same extra-fields + JSON textarea shape, clears itself on a successful create. */
export default function JsonCreateForm({
  createAction,
  placeholder,
  extraFields,
}: {
  createAction: CreateAction;
  placeholder: string;
  extraFields?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(createAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="admin-json-row">
      {extraFields}
      <textarea name="json" rows={10} placeholder={placeholder} required />
      <button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add"}
      </button>
      {state?.error && <p className="admin-login-error">{state.error}</p>}
    </form>
  );
}
