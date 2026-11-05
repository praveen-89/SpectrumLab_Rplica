import type { PersonWithSlug } from "@/lib/content/people";
import PersonCard from "./PersonCard";

export default function PeopleGrid({ people }: { people: PersonWithSlug[] }) {
  return (
    <div className="grid">
      {people.map((person, index) => (
        <PersonCard key={person.slug} person={person} index={index} />
      ))}
    </div>
  );
}
