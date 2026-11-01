"use server";

import { genericUpdateSingleton, type JsonFormState } from "./generic-crud";
import { homePageSchema, opportunitiesPageSchema, contactPageSchema } from "@/lib/content/schemas";

export async function updateHomePage(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdateSingleton("pages", "slug", "home", homePageSchema, String(formData.get("json")), ["/"]);
}

export async function updateOpportunitiesPage(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdateSingleton("pages", "slug", "opportunities", opportunitiesPageSchema, String(formData.get("json")), [
    "/opportunities/",
  ]);
}

export async function updateContactPage(_prevState: JsonFormState | undefined, formData: FormData) {
  return genericUpdateSingleton("pages", "slug", "contact", contactPageSchema, String(formData.get("json")), ["/contactus/"]);
}
