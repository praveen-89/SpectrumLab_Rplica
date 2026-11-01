"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import ImageUpload from "./ImageUpload";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import { slugify, PERSON_GROUPS, PERSON_GROUP_LABELS } from "@/Admin/frontend/slugify";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type PersonFormValues = {
  slug: string;
  name: string;
  group: string;
  status: "current" | "alumni";
  year: string;
  image: string;
  summary: string;
  body: string;
  links: { email: string; scholar: string; github: string; twitter: string; linkedin: string; website: string };
};

const EMPTY: PersonFormValues = {
  slug: "",
  name: "",
  group: "phd-students",
  status: "current",
  year: "",
  image: "",
  summary: "",
  body: "",
  links: { email: "", scholar: "", github: "", twitter: "", linkedin: "", website: "" },
};

const LINK_LABELS: Array<[keyof PersonFormValues["links"], string]> = [
  ["email", "Email"],
  ["scholar", "Google Scholar"],
  ["github", "GitHub"],
  ["twitter", "Twitter"],
  ["linkedin", "LinkedIn"],
  ["website", "Website"],
];

function buildFormData(values: PersonFormValues): FormData {
  const links = Object.fromEntries(Object.entries(values.links).filter(([, v]) => v.trim() !== ""));
  const personData = {
    slug: values.slug,
    name: values.name,
    group: values.group,
    image: values.image || undefined,
    summary: values.summary || undefined,
    body: values.body,
    ...(Object.keys(links).length > 0 ? { links } : {}),
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(personData));
  formData.set("status", values.status);
  formData.set("year", values.status === "alumni" ? values.year : "");
  return formData;
}

type PersonAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function PersonForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<PersonFormValues>;
  createAction?: PersonAction;
  updateAction?: PersonAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<PersonFormValues>({ ...EMPTY, ...initial, links: { ...EMPTY.links, ...initial?.links } });
  const [slugEdited, setSlugEdited] = useState(Boolean(initial?.slug));
  const router = useRouter();

  function set<K extends keyof PersonFormValues>(key: K, value: PersonFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function setLink(key: keyof PersonFormValues["links"], value: string) {
    setValues((current) => ({ ...current, links: { ...current.links, [key]: value } }));
  }

  function handleNameChange(name: string) {
    set("name", name);
    if (!slugEdited) set("slug", slugify(name));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    if (!result?.error && createAction) router.push("/admin/people");
    return result;
  }

  return (
    <AdminForm
      title={createAction ? "Add Person" : "Edit Person"}
      backHref="/admin/people"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/people");
        })
      }
    >
      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="Full Name" htmlFor="name" required>
            <input id="name" value={values.name} onChange={(e) => handleNameChange(e.target.value)} required />
          </FormField>
          <FormField label="Slug" htmlFor="slug" required help="Used in the profile URL.">
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input
                id="slug"
                value={values.slug}
                onChange={(e) => {
                  setSlugEdited(true);
                  set("slug", e.target.value);
                }}
                required
              />
              <button
                type="button"
                className="admin-btn admin-btn-secondary admin-btn-sm"
                onClick={() => {
                  setSlugEdited(true);
                  set("slug", slugify(values.name));
                }}
              >
                Generate
              </button>
            </div>
          </FormField>
        </div>

        <div className="admin-form-row">
          <FormField label="Group" htmlFor="group" required>
            <select id="group" value={values.group} onChange={(e) => set("group", e.target.value)} required>
              {PERSON_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {PERSON_GROUP_LABELS[group]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Status" required>
            <div className="admin-field-radio-group">
              <label>
                <input type="radio" name="status" checked={values.status === "current"} onChange={() => set("status", "current")} />
                Current
              </label>
              <label>
                <input type="radio" name="status" checked={values.status === "alumni"} onChange={() => set("status", "alumni")} />
                Alumni
              </label>
            </div>
          </FormField>
          {values.status === "alumni" && (
            <FormField label="Alumni Year" htmlFor="year" required>
              <input id="year" type="number" value={values.year} onChange={(e) => set("year", e.target.value)} required />
            </FormField>
          )}
        </div>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Photo</span>
        <ImageUpload value={values.image} onChange={(url) => set("image", url)} folder="people" round />
      </div>

      <div className="admin-form-section">
        <FormField label="Summary" htmlFor="summary" help="Short bio shown on the home page.">
          <textarea id="summary" rows={3} value={values.summary} onChange={(e) => set("summary", e.target.value)} />
        </FormField>
        <FormField label="Biography" htmlFor="body" help="Markdown supported.">
          <textarea id="body" rows={8} value={values.body} onChange={(e) => set("body", e.target.value)} />
        </FormField>
      </div>

      <div className="admin-form-section">
        <span className="admin-form-section-title">Links</span>
        <div className="admin-form-row">
          {LINK_LABELS.map(([key, label]) => (
            <FormField label={label} htmlFor={`link-${key}`} key={key}>
              <input id={`link-${key}`} value={values.links[key]} onChange={(e) => setLink(key, e.target.value)} />
            </FormField>
          ))}
        </div>
      </div>
    </AdminForm>
  );
}
