"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type GalleryVideoFormValues = { youtubeId: string; title: string; date: string; caption: string };

const EMPTY: GalleryVideoFormValues = { youtubeId: "", title: "", date: "", caption: "" };

function buildFormData(values: GalleryVideoFormValues): FormData {
  const data = {
    youtubeId: values.youtubeId,
    title: values.title,
    date: values.date || undefined,
    caption: values.caption || undefined,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type GalleryVideoAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function GalleryVideoForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<GalleryVideoFormValues>;
  createAction?: GalleryVideoAction;
  updateAction?: GalleryVideoAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<GalleryVideoFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof GalleryVideoFormValues>(key: K, value: GalleryVideoFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    if (!result?.error && createAction) router.push("/admin/gallery-videos");
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Video" : "Edit Video"}
      backHref="/admin/gallery-videos"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/gallery-videos");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <FormField label="YouTube ID" htmlFor="youtubeId" required help="The id portion of the YouTube URL.">
          <input id="youtubeId" value={values.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} required />
        </FormField>
        {values.youtubeId && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://img.youtube.com/vi/${values.youtubeId}/hqdefault.jpg`}
            alt=""
            style={{ width: 240, borderRadius: 8 }}
          />
        )}
        <div className="admin-form-row">
          <FormField label="Date" htmlFor="date">
            <input id="date" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Caption" htmlFor="caption">
          <textarea id="caption" rows={2} value={values.caption} onChange={(e) => set("caption", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
