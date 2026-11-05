import type { Metadata } from "next";
import { readData } from "@/lib/content/data";
import { funderSchema, grantSchema } from "@/lib/content/schemas";
import FundingCarousel from "@/components/FundingCarousel";
import { BuildingColumnsIcon, UserTieIcon, CalendarIcon, UsersIcon } from "@/components/icons";

export const revalidate = 10;

const DESCRIPTION =
  "Research grants and sponsored projects at Spectrum Lab including government and industry-funded initiatives";

export const metadata: Metadata = {
  title: "Funding",
  description: DESCRIPTION,
  alternates: { canonical: "/funding/" },
};

export default async function FundingPage() {
  const [funders, grants] = await Promise.all([
    readData("funders.json", funderSchema),
    readData("grants.json", grantSchema),
  ]);

  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">Funding</h1>
        <h2 className="post-description">{DESCRIPTION}</h2>
      </header>
      <article data-aos="fade-down">
        <div className="funding">
          <div className="container-md">
            <FundingCarousel funders={funders} />
          </div>
        </div>

        <div className="projects">
          <div className="funding-grid">
            {grants.map((grant, index) => (
              <div
                className="funding-card mb-4 p-3 hoverable"
                key={grant.title}
                data-aos="fade-down"
                data-aos-delay={Math.min(index * 80, 320)}
              >
                <h3 className="card-title mb-1 funding-card__title">{grant.title}</h3>
                <h4 className="card-subtitle mb-3 text-muted">
                  <BuildingColumnsIcon size={14} className="iconinstitution" />
                  {grant.institution}
                </h4>
                <div className="card-text">
                  <div className="row">
                    <div className="col-md-6">
                      <p>
                        <UserTieIcon size={12} className="icondepartment" /> <strong>Role:</strong> {grant.role}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p>
                        <CalendarIcon size={12} className="icondepartment" /> <strong>Duration:</strong>{" "}
                        {grant.startYear}
                        {grant.endYear ? ` - ${grant.endYear}` : ""}
                      </p>
                    </div>
                  </div>
                  {grant.coInvestigators && (
                    <div className="row">
                      <div className="col-md-12">
                        <p>
                          <UsersIcon size={12} className="icondepartment" /> <strong>Co-Investigators:</strong>{" "}
                          {grant.coInvestigators}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
