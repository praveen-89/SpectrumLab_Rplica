"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { slugify } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type NewsFormValues = {
  slug: string;
  date: string;
  category: string;
  title: string;
  link: string;
  hasDetailPage: boolean;
  body: string;
};

const EMPTY: NewsFormValues = {
  slug: "",
  date: new Date().toISOString().slice(0, 10),
  category: "",
  title: "",
  link: "",
  hasDetailPage: false,
  body: "",
};

function buildFormData(values: NewsFormValues): FormData {
  const data = {
    slug: values.slug,
    date: values.date,
    category: values.category || undefined,
    title: values.title || undefined,
    link: !values.hasDetailPage ? values.link || undefined : undefined,
    detailSlug: values.hasDetailPage ? values.slug : undefined,
    body: values.hasDetailPage ? values.body : "",
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type NewsAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function NewsForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<NewsFormValues>;
  createAction?: NewsAction;
  updateAction?: NewsAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<NewsFormValues>({ ...EMPTY, ...initial });
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const router = useRouter();

  function set<K extends keyof NewsFormValues>(key: K, value: NewsFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleTitleChange(title: string) {
    set("title", title);
    if (!slugEdited) set("slug", `${values.date}-${slugify(title)}`);
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
      title={createAction ? "Add News" : "Edit News"}
      backHref="/admin/news"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/news");
        })
      }
    >
      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="Date" htmlFor="date" required>
            <input id="date" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} required />
          </FormField>
          <FormField label="Category" htmlFor="category" help="e.g. Talk, Award, PhD Colloquium.">
            <input id="category" value={values.category} onChange={(e) => set("category", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Title" htmlFor="title">
          <input id="title" value={values.title} onChange={(e) => handleTitleChange(e.target.value)} />
        </FormField>
        <FormField label="Slug" htmlFor="slug" required help="Unique identifier for this item.">
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
      </div>

      <div className="admin-form-section">
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600 }}>
          <input type="checkbox" checked={values.hasDetailPage} onChange={(e) => set("hasDetailPage", e.target.checked)} />
          Has its own detail page
        </label>

        {values.hasDetailPage ? (
          <FormField label="Body" htmlFor="body" help="Markdown supported.">
            <textarea id="body" rows={8} value={values.body} onChange={(e) => set("body", e.target.value)} />
          </FormField>
        ) : (
          <FormField label="External Link" htmlFor="link" help="Points at a talk, teaching page, or other existing page.">
            <input id="link" type="url" value={values.link} onChange={(e) => set("link", e.target.value)} />
          </FormField>
        )}
      </div>
    </AdminForm>
  );
}
