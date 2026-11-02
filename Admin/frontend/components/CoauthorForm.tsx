"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type CoauthorFormValues = { nameKey: string; href: string };

const EMPTY: CoauthorFormValues = { nameKey: "", href: "" };

function buildFormData(values: CoauthorFormValues): FormData {
  const formData = new FormData();
  formData.set("json", JSON.stringify({ href: values.href }));
  formData.set("name_key", values.nameKey);
  return formData;
}

type CoauthorAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function CoauthorForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<CoauthorFormValues>;
  createAction?: CoauthorAction;
  updateAction?: CoauthorAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<CoauthorFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof CoauthorFormValues>(key: K, value: CoauthorFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Coauthor" : "Edit Coauthor"}
      backHref="/admin/coauthors"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/coauthors");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Name" htmlFor="nameKey" required help="Exactly as it appears in a publication's author list.">
          <input id="nameKey" value={values.nameKey} onChange={(e) => set("nameKey", e.target.value)} required disabled={!createAction} />
        </FormField>
        <FormField label="Profile URL" htmlFor="href" required>
          <input id="href" value={values.href} onChange={(e) => set("href", e.target.value)} required />
        </FormField>
      </div>
    </AdminForm>
  );
}
