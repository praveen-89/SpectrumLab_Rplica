// Pure types and type guards, deliberately with no "server-only" import
// (unlike lib/nav.ts) — Navbar.tsx is a Client Component and needs these,
// but not the Supabase-fetching getNavEntries() function itself.

export type NavLink = {
  label: string;
  href: string;
};

export type NavDivider = {
  divider: true;
};

export type NavDropdownItem = NavLink | NavDivider;

export type NavDropdown = {
  label: string;
  items: NavDropdownItem[];
};

export type NavEntry = NavLink | NavDropdown;

export function isNavDropdown(entry: NavEntry): entry is NavDropdown {
  return "items" in entry;
}

export function isNavDivider(item: NavDropdownItem): item is NavDivider {
  return "divider" in item;
}
