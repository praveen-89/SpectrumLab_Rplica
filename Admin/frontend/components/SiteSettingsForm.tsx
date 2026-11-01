"use client";

import { useState } from "react";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type SiteSettingsFormValues = {
  name: string;
  description: string;
  url: string;
  email: string;
  googleScholarUrl: string;
  githubUrl: string;
  twitterUrl: string;
  twitterHandle: string;
};

function buildFormData(values: SiteSettingsFormValues): FormData {
  const data = {
    name: values.name,
    description: values.description,
    url: values.url,
    social: {
      email: values.email,
      googleScholarUrl: values.googleScholarUrl,
      githubUrl: values.githubUrl,
      twitterUrl: values.twitterUrl,
      twitterHandle: values.twitterHandle,
    },
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type SiteSettingsAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function SiteSettingsForm({ initial, updateAction }: { initial: SiteSettingsFormValues; updateAction: SiteSettingsAction }) {
  const [values, setValues] = useState<SiteSettingsFormValues>(initial);

  function set<K extends keyof SiteSettingsFormValues>(key: K, value: SiteSettingsFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    return updateAction(undefined, buildFormData(values));
  }

  return (
    <AdminForm title="Site Settings" backHref="/admin" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="Site Name" htmlFor="name" required>
            <input id="name" value={values.name} onChange={(e) => set("name", e.target.value)} required />
          </FormField>
          <FormField label="Site URL" htmlFor="url" required>
            <input id="url" value={values.url} onChange={(e) => set("url", e.target.value)} required />
          </FormField>
        </div>
        <FormField label="Description" htmlFor="description" required>
          <textarea id="description" rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} required />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Social Links</span>
        <div className="admin-form-row">
          <FormField label="Email" htmlFor="email">
            <input id="email" value={values.email} onChange={(e) => set("email", e.target.value)} />
          </FormField>
          <FormField label="Google Scholar URL" htmlFor="googleScholarUrl">
            <input id="googleScholarUrl" value={values.googleScholarUrl} onChange={(e) => set("googleScholarUrl", e.target.value)} />
          </FormField>
        </div>
        <div className="admin-form-row">
          <FormField label="GitHub URL" htmlFor="githubUrl">
            <input id="githubUrl" value={values.githubUrl} onChange={(e) => set("githubUrl", e.target.value)} />
          </FormField>
          <FormField label="Twitter URL" htmlFor="twitterUrl">
            <input id="twitterUrl" value={values.twitterUrl} onChange={(e) => set("twitterUrl", e.target.value)} />
          </FormField>
          <FormField label="Twitter Handle" htmlFor="twitterHandle">
            <input id="twitterHandle" value={values.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} />
          </FormField>
        </div>
      </div>
    </AdminForm>
  );
}
