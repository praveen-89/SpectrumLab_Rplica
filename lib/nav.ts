import navData from "@/data/nav.json";

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

export const navEntries: NavEntry[] = navData as NavEntry[];
