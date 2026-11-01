"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFunder, deleteFunder } from "@/Admin/backend/actions/funders-actions";
import type { Funder } from "@/lib/content/schemas";

export default function FunderRow({ id, funder }: { id: string; funder: Funder }) {
  const [state, formAction, pending] = useActionState(updateFunder.bind(null, id), undefined);
  const [deleting, startDelete] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startDelete(async () => {
      await deleteFunder(id);
      // revalidatePath inside the action invalidates the cache, but only
      // a <form action> submission gets Next's automatic post-action
      // refresh — this plain action call needs one explicitly, or this
      // admin list keeps showing the deleted row until the next navigation.
      router.refresh();
    });
  }

  return (
    <form action={formAction} className="admin-row">
      <input name="name" defaultValue={funder.name} placeholder="Name" required />
      <input name="logo" defaultValue={funder.logo} placeholder="Logo path or URL" required />
      <input name="url" defaultValue={funder.url ?? ""} placeholder="Link URL (optional)" />
      <button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save"}
      </button>
      <button type="button" disabled={deleting} onClick={handleDelete}>
        {deleting ? "Deleting..." : "Delete"}
      </button>
      {state?.error && <p className="admin-login-error">{state.error}</p>}
    </form>
  );
}
