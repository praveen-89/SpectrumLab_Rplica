"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type RecognitionFormValues = { title: string; year: string; type: string; people: string };

const EMPTY: RecognitionFormValues = { title: "", year: "", type: "fellowship", people: "" };

function buildFormData(values: RecognitionFormValues): FormData {
  const data = {
    type: values.type,
    year: values.year || undefined,
    title: values.title,
    people: values.people
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean)
      .map((name) => ({ name })),
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type RecognitionAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function RecognitionForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<RecognitionFormValues>;
  createAction?: RecognitionAction;
  updateAction?: RecognitionAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<RecognitionFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof RecognitionFormValues>(key: K, value: RecognitionFormValues[K]) {
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
      title={createAction ? "Add Recognition" : "Edit Recognition"}
      backHref="/admin/recognition"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/recognition");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <div className="admin-form-row">
          <FormField label="Year" htmlFor="year">
            <input id="year" value={values.year} onChange={(e) => set("year", e.target.value)} />
          </FormField>
          <FormField label="Type" htmlFor="type" required>
            <select id="type" value={values.type} onChange={(e) => set("type", e.target.value)}>
              <option value="fellowship">Fellowship</option>
              <option value="medal">Medal</option>
              <option value="invention">Invention</option>
              <option value="other">Other</option>
            </select>
          </FormField>
        </div>
        <FormField label="People" htmlFor="people" required help="Comma-separated names.">
          <input id="people" value={values.people} onChange={(e) => set("people", e.target.value)} required />
        </FormField>
      </div>
    </AdminForm>
  );
}
