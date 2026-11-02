"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FormField from "./FormField";
import DynamicList from "./DynamicList";
import AdminForm, { type AdminFormResult } from "./AdminForm";
import type { JsonFormState } from "@/Admin/backend/actions/generic-crud";

export type PublicationFormValues = {
  key: string;
  type: string;
  title: string;
  authors: string[];
  year: string;
  month: string;
  venue: string;
  abbr: string;
  doi: string;
  url: string;
  pdf: string;
  code: string;
  articlePage: string;
  abstract: string;
  bibtex: string;
};

const EMPTY: PublicationFormValues = {
  key: "",
  type: "article",
  title: "",
  authors: [""],
  year: String(new Date().getFullYear()),
  month: "",
  venue: "",
  abbr: "",
  doi: "",
  url: "",
  pdf: "",
  code: "",
  articlePage: "",
  abstract: "",
  bibtex: "",
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function buildFormData(values: PublicationFormValues): FormData {
  const data = {
    key: values.key,
    type: values.type,
    title: values.title,
    authors: values.authors.filter((a) => a.trim() !== ""),
    year: Number(values.year),
    month: values.month || undefined,
    venue: values.venue || undefined,
    abbr: values.abbr || undefined,
    doi: values.doi || undefined,
    url: values.url || undefined,
    pdf: values.pdf || undefined,
    code: values.code || undefined,
    articlePage: values.articlePage || undefined,
    abstract: values.abstract || undefined,
    bibtex: values.bibtex,
  };
  const formData = new FormData();
  formData.set("json", JSON.stringify(data));
  return formData;
}

type PublicationAction = (prevState: JsonFormState | undefined, formData: FormData) => Promise<JsonFormState>;

export default function PublicationForm({
  initial,
  createAction,
  updateAction,
  deleteAction,
}: {
  initial?: Partial<PublicationFormValues>;
  createAction?: PublicationAction;
  updateAction?: PublicationAction;
  deleteAction?: () => Promise<void>;
}) {
  const [values, setValues] = useState<PublicationFormValues>({ ...EMPTY, ...initial });
  const router = useRouter();

  function set<K extends keyof PublicationFormValues>(key: K, value: PublicationFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(): Promise<AdminFormResult> {
    const formData = buildFormData(values);
    const action = updateAction ?? createAction;
    if (!action) return;
    const result = await action(undefined, formData);
    return result;
  }

  const venueLabel = values.type === "article" ? "Journal" : "Booktitle / Conference";

  return (
    <AdminForm
      title={createAction ? "Add Publication" : "Edit Publication"}
      backHref="/admin/publications"
      onSubmit={handleSubmit}
      onDelete={
        deleteAction &&
        (async () => {
          await deleteAction();
          router.push("/admin/publications");
        })
      }
    >
      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="BibTeX Key" htmlFor="key" required help="Unique identifier — keep stable once set.">
            <input id="key" value={values.key} onChange={(e) => set("key", e.target.value)} required disabled={!createAction} />
          </FormField>
          <FormField label="Type" htmlFor="type" required>
            <select id="type" value={values.type} onChange={(e) => set("type", e.target.value)}>
              <option value="article">Article</option>
              <option value="inproceedings">Inproceedings</option>
              <option value="incollection">Incollection</option>
              <option value="misc">Misc</option>
            </select>
          </FormField>
        </div>
        <FormField label="Title" htmlFor="title" required>
          <input id="title" value={values.title} onChange={(e) => set("title", e.target.value)} required />
        </FormField>
        <FormField label="Authors" help="One per row, in order. Use the arrows to reorder.">
          <DynamicList values={values.authors} onChange={(authors) => set("authors", authors)} placeholder="Author name" addLabel="Add author" reorder />
        </FormField>
      </div>

      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="Year" htmlFor="year" required>
            <input id="year" type="number" value={values.year} onChange={(e) => set("year", e.target.value)} required />
          </FormField>
          <FormField label="Month" htmlFor="month">
            <select id="month" value={values.month} onChange={(e) => set("month", e.target.value)}>
              <option value="">—</option>
              {MONTHS.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="admin-form-row">
          <FormField label={venueLabel} htmlFor="venue">
            <input id="venue" value={values.venue} onChange={(e) => set("venue", e.target.value)} />
          </FormField>
          <FormField label="Venue Abbreviation" htmlFor="abbr" help='e.g. "ICASSP 25"'>
            <input id="abbr" value={values.abbr} onChange={(e) => set("abbr", e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="admin-form-section">
        <div className="admin-form-row">
          <FormField label="DOI" htmlFor="doi">
            <input id="doi" value={values.doi} onChange={(e) => set("doi", e.target.value)} />
          </FormField>
          <FormField label="URL" htmlFor="url">
            <input id="url" type="url" value={values.url} onChange={(e) => set("url", e.target.value)} />
          </FormField>
        </div>
        <div className="admin-form-row">
          <FormField label="PDF URL" htmlFor="pdf">
            <input id="pdf" type="url" value={values.pdf} onChange={(e) => set("pdf", e.target.value)} />
          </FormField>
          <FormField label="Code URL" htmlFor="code">
            <input id="code" type="url" value={values.code} onChange={(e) => set("code", e.target.value)} />
          </FormField>
          <FormField label="Article Page URL" htmlFor="articlePage">
            <input id="articlePage" type="url" value={values.articlePage} onChange={(e) => set("articlePage", e.target.value)} />
          </FormField>
        </div>
      </div>

      <div className="admin-form-section">
        <FormField label="Abstract" htmlFor="abstract">
          <textarea id="abstract" rows={4} value={values.abstract} onChange={(e) => set("abstract", e.target.value)} />
        </FormField>
        <FormField label="BibTeX" htmlFor="bibtex" required help="The full BibTeX entry text.">
          <textarea id="bibtex" rows={6} value={values.bibtex} onChange={(e) => set("bibtex", e.target.value)} required />
        </FormField>
      </div>
    </AdminForm>
  );
}
