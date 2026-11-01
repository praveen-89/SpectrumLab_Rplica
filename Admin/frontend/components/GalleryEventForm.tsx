"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { uploadImage } from "@/Admin/backend/actions/upload-actions";
import { slugify } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type GalleryEventFormValues = {
  title: string;
  description: string;
  photos: Array<{ src: string; caption: string }>;
};

const EMPTY: GalleryEventFormValues = { title: "", description: "", photos: [] };

function buildFormData(values: GalleryEventFormValues): FormData {
  const data = {
    title: values.title || undefined,
    description: values.description || undefined,
    photos: values.photos.map((photo) => ({ src: photo.src, caption: photo.caption || undefined })),
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type GalleryEventAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function GalleryEventForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<GalleryEventFormValues>;
  createAction?: GalleryEventAction;
  updateAction?: GalleryEventAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<GalleryEventFormValues>({ ...EMPTY, ...initial });
  const [uploading, startUpload] = useTransition();
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  function set<K extends keyof GalleryEventFormValues>(key: K, value: GalleryEventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const folder = `gallery/${slugify(values.title || "event")}`;
    startUpload(async () => {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(folder, formData);
        if (result.error) {
          setUploadError(result.error);
          continue;
        }
        if (result.url) {
          setValues((current) => ({ ...current, photos: [...current.photos, { src: result.url!, caption: "" }] }));
        }
      }
    });
  }

  function updateCaption(index: number, caption: string) {
    setValues((current) => ({ ...current, photos: current.photos.map((p, i) => (i === index ? { ...p, caption } : p)) }));
  }

  function removePhoto(index: number) {
    setValues((current) => ({ ...current, photos: current.photos.filter((_, i) => i !== index) }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    if (!result?.error && createAction) router.push("/admin/gallery-events");
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Photo Event" : "Edit Photo Event"}
      backHref="/admin/gallery-events"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/gallery-events");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Event Name" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <FormField label="Description" htmlFor="description">
          <textarea id="description" rows={2} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Photos</span>
        <label className="admin-dropzone">
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} disabled={uploading} />
          {uploading ? "Uploading..." : "Click to choose photos to upload"}
        </label>
        {uploadError && <span className="admin-field-error">{uploadError}</span>}

        {values.photos.length > 0 && (
          <div className="admin-multi-upload-grid">
            {values.photos.map((photo, index) => (
              <div className="admin-multi-upload-item" key={photo.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt="" />
                <input
                  type="text"
                  placeholder="Caption"
                  value={photo.caption}
                  onChange={(e) => updateCaption(index, e.target.value)}
                />
                <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={() => removePhoto(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminForm>
  );
}
