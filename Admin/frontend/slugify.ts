export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Mirrors lib/content/schemas.ts's personGroupSchema enum — duplicated
// here (rather than imported) because that file has a top-level
// "server-only" import and PersonForm is a Client Component.
export const PERSON_GROUPS = [
  "lab-director",
  "phd-students",
  "mtech-students",
  "mtech-research",
  "phd-graduates",
  "mtech-graduates",
  "mtech-research-graduates",
  "research-associates",
  "project-associates",
  "interns",
  "current-post-docs",
  "past-post-docs",
  "administrator",
] as const;

export const PERSON_GROUP_LABELS: Record<string, string> = {
  "lab-director": "Lab Director",
  "phd-students": "PhD Students",
  "mtech-students": "M.Tech Students",
  "mtech-research": "M.Tech Research Students",
  "phd-graduates": "PhD Graduates",
  "mtech-graduates": "M.Tech Graduates",
  "mtech-research-graduates": "M.Tech Research Graduates",
  "research-associates": "Research Associates",
  "project-associates": "Project Associates",
  interns: "Interns",
  "current-post-docs": "Current Post-docs",
  "past-post-docs": "Past Post-docs",
  administrator: "Administrator",
};
