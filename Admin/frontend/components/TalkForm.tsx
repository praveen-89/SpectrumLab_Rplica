"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { slugify } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type TalkFormValues = {
  slug: string;
  kind: "organized" | "delivered";
  title: string;
  date: string;
  venue: string;
  speaker: string;
  slides: string;
  video: string;
  eventUrl: string;
  tags: string;
  abstract: string;
};

const EMPTY: TalkFormValues = {
  slug: "",
  kind: "organized",
  title: "",
  date: new Date().toISOString().slice(0, 10),
  venue: "",
  speaker: "",
  slides: "",
  video: "",
  eventUrl: "",
  tags: "",
  abstract: "",
};

function buildFormData(values: TalkFormValues): FormData {
  const year = values.date.slice(0, 4);
  const leafSlug = values.slug.includes("/") ? values.slug.split("/")[1] : values.slug;
  const keywords = values.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const data = {
    slug: `${year}/${leafSlug}`,
    title: values.title,
    date: values.date,
    venue: values.venue || undefined,
    speakers: values.speaker ? [{ name: values.speaker }] : [],
    keywords,
    links: {
      slides: values.slides || undefined,
      video: values.video || undefined,
      url: values.eventUrl || undefined,
    },
    body: values.abstract,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  formData.set("kind", values.kind);
  return formData;
}

type TalkAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function TalkForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<TalkFormValues>;
  createAction?: TalkAction;
  updateAction?: TalkAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<TalkFormValues>({ ...EMPTY, ...initial });
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const router = useRouter();

  function set<K extends keyof TalkFormValues>(key: K, value: TalkFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugEdited) set("slug", slugify(title));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    return result;
  }

  const tagList = values.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);

  return (
    <AdminForm
      title={createAction ? "Add Talk" : "Edit Talk"}
      backHref="/admin/talks"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/talks");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Type" required>
          <div className="admin-field-radio-group">
            <label>
              <input type="radio" name="kind" checked={values.kind === "organized"} onChange={() => set("kind", "organized")} />
              Organized
            </label>
            <label>
              <input type="radio" name="kind" checked={values.kind === "delivered"} onChange={() => set("kind", "delivered")} />
              Delivered
            </label>
          </div>
        </FormField>
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </FormField>
        <FormField label="Slug" htmlFor="slug" required help="The year is taken from the date automatically.">
          <input
            id="slug"
            value={values.slug}
            onChange={(e) => {
              setSlugEdited(true);
              set("slug", e.target.value);
            }}
            required
          />
        </FormField>
        <div className="admin-form-row">
          <FormField label="Date" htmlFor="date" required>
            <input id="date" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} required />
          </FormField>
          <FormField label="Venue" htmlFor="venue">
            <input id="venue" value={values.venue} onChange={(e) => set("venue", e.target.value)} />
          </FormField>
          <FormField label="Speaker" htmlFor="speaker">
            <input id="speaker" value={values.speaker} onChange={(e) => set("speaker", e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Links</span>
        <div className="admin-form-row">
          <FormField label="Slides URL" htmlFor="slides">
            <input id="slides" type="url" value={values.slides} onChange={(e) => set("slides", e.target.value)} />
          </FormField>
          <FormField label="Video URL" htmlFor="video">
            <input id="video" type="url" value={values.video} onChange={(e) => set("video", e.target.value)} />
          </FormField>
          <FormField label="Event URL" htmlFor="eventUrl">
            <input id="eventUrl" type="url" value={values.eventUrl} onChange={(e) => set("eventUrl", e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="admin-form-section">
        <FormField label="Tags" htmlFor="tags" help="Comma-separated.">
          <input id="tags" value={values.tags} onChange={(e) => set("tags", e.target.value)} />
          {tagList.length > 0 && (
            <div className="admin-tag-chips">
              {tagList.map((tag) => (
                <span key={tag} className="admin-tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </FormField>
        <FormField label="Abstract" htmlFor="abstract">
          <textarea id="abstract" rows={6} value={values.abstract} onChange={(e) => set("abstract", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
