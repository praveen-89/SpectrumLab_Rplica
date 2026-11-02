"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { slugify } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type ArticleFormValues = { slug: string; title: string; date: string; excerpt: string; body: string; youtubeId: string };

const EMPTY: ArticleFormValues = { slug: "", title: "", date: "", excerpt: "", body: "", youtubeId: "" };

function buildFormData(values: ArticleFormValues): FormData {
  const body = values.youtubeId ? `${values.body}\n\n{% youtube ${values.youtubeId} %}` : values.body;
  const data = { slug: values.slug, title: values.title, date: values.date || undefined, excerpt: values.excerpt, body };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type ArticleAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function ArticleForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<ArticleFormValues>;
  createAction?: ArticleAction;
  updateAction?: ArticleAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<ArticleFormValues>({ ...EMPTY, ...initial });
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const router = useRouter();

  function set<K extends keyof ArticleFormValues>(key: K, value: ArticleFormValues[K]) {
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

  return (
    <AdminForm
      title={createAction ? "Add Article" : "Edit Article"}
      backHref="/admin/articles"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/articles");
        })
      }
    >
      <div className="admin-form-section">
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </FormField>
        <div className="admin-form-row">
          <FormField label="Slug" htmlFor="slug" required>
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
          <FormField label="Date" htmlFor="date">
            <input id="date" type="date" value={values.date} onChange={(e) => set("date", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Excerpt" htmlFor="excerpt" required>
          <textarea id="excerpt" rows={3} value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} required />
        </FormField>
      </div>

      <div className="admin-form-section">
        <FormField label="Body" htmlFor="body" help="Markdown supported.">
          <textarea id="body" rows={10} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
        <FormField label="YouTube ID" htmlFor="youtubeId" help="Optional — appended to the body as an embed.">
          <input id="youtubeId" value={values.youtubeId} onChange={(e) => set("youtubeId", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
