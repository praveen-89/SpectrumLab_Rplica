"use client";

import { useState } from "react";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type HomePageFormValues = {
  body: string;
  groupPhoto: string;
  groupPhotoCaption: string;
  iiscLogoLight: string;
  iiscLogoDark: string;
  iiscLogoUrl: string;
  eeLogo: string;
  eeLogoUrl: string;
};

function buildFormData(values: HomePageFormValues): FormData {
  const formData = new FormData();
  formData.set("json", JSON.stringify(values));
  return formData;
}

type HomePageAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function HomePageForm({ initial, updateAction }: { initial: HomePageFormValues; updateAction: HomePageAction }) {
  const [values, setValues] = useState<HomePageFormValues>(initial);

  function set<K extends keyof HomePageFormValues>(key: K, value: HomePageFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    return updateAction(undefined, buildFormData(values));
  }

  return (
    <AdminForm title="Home Page" backHref="/admin" onSubmit={handleSubmit}>
      <div className="admin-form-section">
        <FormField label="Hero Text" htmlFor="body" help="Markdown supported.">
          <textarea id="body" rows={5} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Group Photo</span>
        <ImageUpload value={values.groupPhoto} onChange={(url) => set("groupPhoto", url)} folder="home" />
        <FormField label="Caption" htmlFor="groupPhotoCaption">
          <input id="groupPhotoCaption" value={values.groupPhotoCaption} onChange={(e) => set("groupPhotoCaption", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Logos</span>
        <div className="admin-form-row">
          <FormField label="IISc Logo (light)" htmlFor="iiscLogoLight">
            <input id="iiscLogoLight" value={values.iiscLogoLight} onChange={(e) => set("iiscLogoLight", e.target.value)} />
          </FormField>
          <FormField label="IISc Logo (dark)" htmlFor="iiscLogoDark">
            <input id="iiscLogoDark" value={values.iiscLogoDark} onChange={(e) => set("iiscLogoDark", e.target.value)} />
          </FormField>
          <FormField label="IISc Link URL" htmlFor="iiscLogoUrl">
            <input id="iiscLogoUrl" value={values.iiscLogoUrl} onChange={(e) => set("iiscLogoUrl", e.target.value)} />
          </FormField>
        </div>
        <div className="admin-form-row">
          <FormField label="EE Logo" htmlFor="eeLogo">
            <input id="eeLogo" value={values.eeLogo} onChange={(e) => set("eeLogo", e.target.value)} />
          </FormField>
          <FormField label="EE Link URL" htmlFor="eeLogoUrl">
            <input id="eeLogoUrl" value={values.eeLogoUrl} onChange={(e) => set("eeLogoUrl", e.target.value)} />
          </FormField>
        </div>
      </div>
    </AdminForm>
  );
}
