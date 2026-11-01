// Shared between the sidebar and the dashboard's overview cards, so the
// two never drift out of sync as content types are added.

export type AdminNavItem = { href: string; label: string; description: string };
export type AdminNavGroup = { label: string; items: AdminNavItem[]; caution?: boolean };

export const ADMIN_NAV: AdminNavGroup[] = [
  {
    label: "Pages",
    items: [
      { href: "/admin/pages/home", label: "Home Page", description: "Hero text, group photo, logos" },
      { href: "/admin/pages/opportunities", label: "Opportunities Page", description: "Open positions, how to apply" },
      { href: "/admin/pages/contact", label: "Contact Page", description: "Address, map, administrator" },
    ],
  },
  {
    label: "Publications & People",
    items: [
      { href: "/admin/publications", label: "Publications", description: "Papers, BibTeX, abstracts" },
      { href: "/admin/coauthors", label: "Coauthors", description: "Name → profile link mapping" },
      { href: "/admin/people", label: "People", description: "Current members and alumni" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/news", label: "News", description: "News feed and home page highlights" },
      { href: "/admin/articles", label: "Articles", description: "Long-form writeups" },
      { href: "/admin/talks", label: "Talks", description: "Organized and delivered talks" },
      { href: "/admin/teaching", label: "Teaching", description: "Courses and materials" },
    ],
  },
  {
    label: "Media",
    items: [
      { href: "/admin/gallery-events", label: "Gallery Photos", description: "Photo events" },
      { href: "/admin/gallery-videos", label: "Gallery Videos", description: "YouTube videos" },
    ],
  },
  {
    label: "Recognition & Funding",
    items: [
      { href: "/admin/recognition", label: "Recognition", description: "Awards and honors" },
      { href: "/admin/funders", label: "Funders", description: "Funding page logos" },
      { href: "/admin/grants", label: "Grants", description: "Funded projects" },
    ],
  },
  {
    label: "Site Structure",
    caution: true,
    items: [
      { href: "/admin/site-config/nav", label: "Navigation", description: "Navbar links on every page" },
      { href: "/admin/site-config/site", label: "Site Settings", description: "Site name, social links, SEO" },
      { href: "/admin/site-config/people-groups", label: "People Group Labels", description: "Group page titles" },
    ],
  },
];
