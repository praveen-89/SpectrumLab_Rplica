"use client";

import { useState } from "react";
import FormField from "./FormField";
import DynamicList from "./DynamicList";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type OpportunitiesPageFormValues = {
  body: string;
  requiredSkills: string[];
  applicationProcess: string;
  readyToApply: string;
  positionsJson: string;
  additionalResourcesJson: string;
};

function buildFormData(values: OpportunitiesPageFormValues): { formData: FormData } | { error: string } {
  let positions: unknown;
  let additionalResources: unknown;
  try {
    positions = JSON.parse(values.positionsJson);
    additionalResources = JSON.parse(values.additionalResourcesJson);
  } catch {
    return { error: "Positions and Additional Resources must be valid JSON." };
  }
  const data = {
    body: values.body,
    requiredSkills: values.requiredSkills.filter((skill) => skill.trim() !== ""),
    applicationProcess: values.applicationProcess,
    readyToApply: values.readyToApply,
    positions,
    additionalResources,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return { formData };
}

type OpportunitiesPageAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function OpportunitiesPageForm({
  initial,
  updateAction,
}: {
  initial: OpportunitiesPageFormValues;
  updateAction: OpportunitiesPageAction;
}) {
  const [values, setValues] = useState<OpportunitiesPageFormValues>(initial);

  function set<K extends keyof OpportunitiesPageFormValues>(key: K, value: OpportunitiesPageFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const built = buildFormData(values);
    if ("error" in built) return { error: built.error };
    return updateAction(undefined, built.formData);
  }

  return (
    <AdminForm title="Opportunities Page" backHref="/admin" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <FormField label="Intro" htmlFor="body" help="Markdown — the 'Join Our Research Team' lead paragraph.">
          <textarea id="body" rows={3} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
        <FormField label="Required Skills">
          <DynamicList values={values.requiredSkills} onChange={(skills) => set("requiredSkills", skills)} placeholder="Skill" addLabel="Add skill" />
        </FormField>
        <FormField label="Application Process" htmlFor="applicationProcess" help="Markdown supported.">
          <textarea id="applicationProcess" rows={4} value={values.applicationProcess} onChange={(e) => set("applicationProcess", e.target.value)} />
        </FormField>
        <FormField label="Ready to Apply? Note" htmlFor="readyToApply" help="Markdown supported.">
          <textarea id="readyToApply" rows={3} value={values.readyToApply} onChange={(e) => set("readyToApply", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Advanced</span>
        <FormField label="Positions (JSON)" htmlFor="positionsJson" help="Array of { icon, title, body }.">
          <textarea
            id="positionsJson"
            rows={8}
            value={values.positionsJson}
            onChange={(e) => set("positionsJson", e.target.value)}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}
          />
        </FormField>
        <FormField label="Additional Resources (JSON)" htmlFor="additionalResourcesJson" help="Array of { label, url }.">
          <textarea
            id="additionalResourcesJson"
            rows={4}
            value={values.additionalResourcesJson}
            onChange={(e) => set("additionalResourcesJson", e.target.value)}
            style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.85rem" }}
          />
        </FormField>
      </div>
    </AdminForm>
  );
}
