"use client";

import { useState } from "react";
import FormField from "./FormField";
import DynamicList from "./DynamicList";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type ContactPageFormValues = {
  mapEmbedUrl: string;
  administratorName: string;
  administratorEmail: string;
  administratorPhone: string;
  address: string[];
  body: string;
  collaborators: string;
};

function buildFormData(values: ContactPageFormValues): FormData {
  const data = {
    mapEmbedUrl: values.mapEmbedUrl,
    administrator: {
      name: values.administratorName,
      email: values.administratorEmail,
      phone: values.administratorPhone || undefined,
    },
    address: values.address.filter((line) => line.trim() !== ""),
    body: values.body,
    collaborators: values.collaborators,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type ContactPageAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function ContactPageForm({ initial, updateAction }: { initial: ContactPageFormValues; updateAction: ContactPageAction }) {
  const [values, setValues] = useState<ContactPageFormValues>(initial);

  function set<K extends keyof ContactPageFormValues>(key: K, value: ContactPageFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    return updateAction(undefined, buildFormData(values));
  }

  return (
    <AdminForm title="Contact Page" backHref="/admin" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <FormField label="Campus Location Intro" htmlFor="body" help="Markdown supported.">
          <textarea id="body" rows={4} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
        <FormField label="Map Embed URL" htmlFor="mapEmbedUrl">
          <input id="mapEmbedUrl" value={values.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} />
        </FormField>
        <FormField label="Potential Collaborators Note" htmlFor="collaborators" help="Markdown supported.">
          <textarea id="collaborators" rows={3} value={values.collaborators} onChange={(e) => set("collaborators", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Administrator</span>
        <div className="admin-form-row">
          <FormField label="Name" htmlFor="administratorName" required>
            <input id="administratorName" value={values.administratorName} onChange={(e) => set("administratorName", e.target.value)} required />
          </FormField>
          <FormField label="Email" htmlFor="administratorEmail" required>
            <input
              id="administratorEmail"
              type="email"
              value={values.administratorEmail}
              onChange={(e) => set("administratorEmail", e.target.value)}
              required
            />
          </FormField>
          <FormField label="Phone" htmlFor="administratorPhone">
            <input id="administratorPhone" value={values.administratorPhone} onChange={(e) => set("administratorPhone", e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="admin-form-section">
        <FormField label="Mailing Address" help="One line at a time.">
          <DynamicList values={values.address} onChange={(address) => set("address", address)} placeholder="Address line" addLabel="Add line" />
        </FormField>
      </div>
    </AdminForm>
  );
}
