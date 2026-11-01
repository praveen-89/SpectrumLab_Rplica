"use client";

import { useActionState, useEffect, useRef } from "react";
import { createFunder } from "@/Admin/backend/actions/funders-actions";

export default function FunderCreateForm() {
  const [state, formAction, pending] = useActionState(createFunder, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && !state.error) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="admin-row">
      <input name="name" placeholder="Name" required />
      <input name="logo" placeholder="Logo path or URL" required />
      <input name="url" placeholder="Link URL (optional)" />
      <button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add funder"}
      </button>
      {state?.error && <p className="admin-login-error">{state.error}</p>}
    </form>
  );
}
