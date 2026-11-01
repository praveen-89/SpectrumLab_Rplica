"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type GrantFormValues = { title: string; institution: string; role: string; startYear: string; endYear: string; coInvestigators: string };

const EMPTY: GrantFormValues = { title: "", institution: "", role: "PI", startYear: String(new Date().getFullYear()), endYear: "", coInvestigators: "" };

function buildFormData(values: GrantFormValues): FormData {
  const data = {
    title: values.title,
    institution: values.institution,
    role: values.role,
    startYear: Number(values.startYear),
    endYear: values.endYear ? Number(values.endYear) : undefined,
    coInvestigators: values.coInvestigators || undefined,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type GrantAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function GrantForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<GrantFormValues>;
  createAction?: GrantAction;
  updateAction?: GrantAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<GrantFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof GrantFormValues>(key: K, value: GrantFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    if (!result?.error && createAction) router.push("/admin/grants");
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Grant" : "Edit Grant"}
      backHref="/admin/grants"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/grants");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <div className="admin-form-row">
          <FormField label="Institution / Agency" htmlFor="institution" required>
            <input id="institution" value={values.institution} onChange={(e) => set("institution", e.target.value)} required />
          </FormField>
          <FormField label="Role" htmlFor="role" required>
            <input id="role" value={values.role} onChange={(e) => set("role", e.target.value)} required />
          </FormField>
        </div>
        <div className="admin-form-row">
          <FormField label="Start Year" htmlFor="startYear" required>
            <input id="startYear" type="number" value={values.startYear} onChange={(e) => set("startYear", e.target.value)} required />
          </FormField>
          <FormField label="End Year" htmlFor="endYear">
            <input id="endYear" type="number" value={values.endYear} onChange={(e) => set("endYear", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Co-investigators" htmlFor="coInvestigators">
          <input id="coInvestigators" value={values.coInvestigators} onChange={(e) => set("coInvestigators", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
