"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { FunderFormState } from "@/Admin/backend/actions/funders-actions";

export type FunderFormValues = { name: string; logo: string; url: string };

const EMPTY: FunderFormValues = { name: "", logo: "", url: "" };

function buildFormData(values: FunderFormValues): FormData {
  const formData = new FormData();
  formData.set("name", values.name);
  formData.set("logo", values.logo);
  formData.set("url", values.url);
  return formData;
}

type FunderAction = (prevState: FunderFormState | undefined, formData: FormData) => Promise<FunderFormState>;

export default function FunderForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<FunderFormValues>;
  createAction?: FunderAction;
  updateAction?: FunderAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<FunderFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof FunderFormValues>(key: K, value: FunderFormValues[K]) {
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
      title={createAction ? "Add Funder" : "Edit Funder"}
      backHref="/admin/funders"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/funders");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Name" htmlFor="name" required>
          <input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
        </FormField>
        <FormField label="Logo" required>
          <ImageUpload value={values.logo} onChange={(url) => set("logo", url)} folder="funders" />
        </FormField>
        <FormField label="Link URL" htmlFor="url">
          <input id="url" type="url" value={values.url} onChange={(e) => set("url", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
