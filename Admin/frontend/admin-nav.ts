// Shared between the sidebar and the topbar's page-title lookup, so the
// two never drift out of sync as content types are added.

export type AdminNavItem = { href: string; label: string };
export type AdminNavGroup = { label: string; items: AdminNavItem[]; caution?: boolean };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Pages",
    items: [
      { href: "/admin/pages/home", label: "Home Page" },
      { href: "/admin/pages/opportunities", label: "Opportunities Page" },
      { href: "/admin/pages/contact", label: "Contact Page" },
    ],
  },
  {
    label: "Publications & People",
    items: [
      { href: "/admin/publications", label: "Publications" },
      { href: "/admin/coauthors", label: "Coauthors" },
      { href: "/admin/people", label: "People" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/news", label: "News" },
      { href: "/admin/articles", label: "Articles" },
      { href: "/admin/talks", label: "Talks" },
      { href: "/admin/teaching", label: "Teaching" },
    ],
  },
  {
    label: "Media",
    items: [
      { href: "/admin/gallery-events", label: "Gallery Photos" },
      { href: "/admin/gallery-videos", label: "Gallery Videos" },
    ],
  },
  {
    label: "Recognition & Funding",
    items: [
      { href: "/admin/recognition", label: "Recognition" },
      { href: "/admin/funders", label: "Funders" },
      { href: "/admin/grants", label: "Grants" },
    ],
  },
  {
    label: "Site Structure",
    caution: true,
    items: [
      { href: "/admin/site-config/nav", label: "Navigation" },
      { href: "/admin/site-config/site", label: "Site Settings" },
      { href: "/admin/site-config/people-groups", label: "People Group Labels" },
    ],
  },
];
