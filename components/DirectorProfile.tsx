import { Suspense } from "react";
import type { PersonWithSlug } from "@/lib/content/people";
import { PersonPhotoAndLinks, BiographyContent } from "./PersonProfile";
import ActivityAccordion from "./ActivityAccordion";

export default async function DirectorProfile({ person }: { person: PersonWithSlug }) {
  return (
    <div className="container my-5">
      <div className="row">
        <PersonPhotoAndLinks person={person} />
        <div className="col-md-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <BiographyContent person={person} />
              {person.awards.length > 0 && (
                <>
                  <h3 className="mt-4">Awards</h3>
                  <ul>
                    {person.awards.map((award) => (
                      <li key={award}>{award}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>

          {person.accordion.length > 0 && (
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-body">
                <h2 className="card-title mb-4">Professional Activities</h2>
                <Suspense fallback={null}>
                  <ActivityAccordion sections={person.accordion} />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
