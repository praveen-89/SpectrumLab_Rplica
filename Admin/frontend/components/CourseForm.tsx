"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { slugify } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type CourseFormValues = { slug: string; code: string; title: string; section: string; term: string; description: string; body: string };

const EMPTY: CourseFormValues = { slug: "", code: "", title: "", section: "regular", term: "", description: "", body: "" };

function buildFormData(values: CourseFormValues): FormData {
  const data = {
    slug: values.slug,
    code: values.code || undefined,
    title: values.title,
    section: values.section,
    term: values.term || undefined,
    description: values.description || undefined,
    body: values.body,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type CourseAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function CourseForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<CourseFormValues>;
  createAction?: CourseAction;
  updateAction?: CourseAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<CourseFormValues>({ ...EMPTY, ...initial });
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const router = useRouter();

  function set<K extends keyof CourseFormValues>(key: K, value: CourseFormValues[K]) {
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
    if (!result?.error && createAction) router.push("/admin/teaching");
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Course" : "Edit Course"}
      backHref="/admin/teaching"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/teaching");
        })
      }
    >
      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="Code" htmlFor="code" help='e.g. "E9 213"'>
            <input id="code" value={values.code} onChange={(e) => set("code", e.target.value)} />
          </FormField>
          <FormField label="Section" htmlFor="section" required>
            <select id="section" value={values.section} onChange={(e) => set("section", e.target.value)}>
              <option value="regular">Regular Course</option>
              <option value="short">Short Course</option>
              <option value="module">Module</option>
            </select>
          </FormField>
          <FormField label="Term" htmlFor="term">
            <input id="term" value={values.term} onChange={(e) => set("term", e.target.value)} />
          </FormField>
        </div>
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => handleTitleChange(e.target.value)} required />
        </FormField>
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
      </div>

      <div className="admin-form-section">
        <FormField label="Description" htmlFor="description">
          <textarea id="description" rows={3} value={values.description} onChange={(e) => set("description", e.target.value)} />
        </FormField>
        <FormField label="Body" htmlFor="body" help="Markdown supported.">
          <textarea id="body" rows={6} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
      </div>
    </AdminForm>
  );
}
