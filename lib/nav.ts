import "server-only";
import { cache } from "react";
import { supabasePublic } from "./supabase/public";
import type { NavEntry } from "./nav-types";

export type { NavLink, NavDivider, NavDropdownItem, NavDropdown, NavEntry } from "./nav-types";
export { isNavDropdown, isNavDivider } from "./nav-types";

/** The navbar's structure — read from Supabase's site_config table (admin-managed equivalent of the old data/nav.json). */
export const getNavEntries = cache(async (): Promise<NavEntry[]> => {
  const { data: row, error } = await supabasePublic.from("site_config").select("data").eq("key", "nav").single();
  if (error) throw new Error(`Failed to read nav entries from Supabase: ${error.message}`);
  return row.data as NavEntry[];
});
