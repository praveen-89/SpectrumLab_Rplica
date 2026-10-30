import Link from "next/link";
import { navEntries, isNavDropdown, isNavDivider, type NavLink } from "@/lib/nav";

// Not present in the original (its only cross-group navigation is the
// navbar's People dropdown) — added per this step's brief so a visitor
// browsing one group's list can reach the others without leaving the page.
export default function PeopleGroupNav({ activeHref }: { activeHref: string }) {
  const peopleDropdown = navEntries.find((entry) => isNavDropdown(entry) && entry.label === "People");
  if (!peopleDropdown || !isNavDropdown(peopleDropdown)) return null;

  const groups = peopleDropdown.items.filter((item): item is NavLink => !isNavDivider(item));

  return (
    <nav className="people-group-nav" aria-label="People groups">
      {groups.map((group) => (
        <Link
          key={group.href}
          href={group.href}
          className={`people-group-pill${group.href === activeHref ? " active" : ""}`}
          aria-current={group.href === activeHref ? "page" : undefined}
        >
          {group.label}
        </Link>
      ))}
    </nav>
  );
}
