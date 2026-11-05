import type { Metadata } from "next";
import { readPage } from "@/lib/content/page";
import { renderMarkdown } from "@/lib/content/markdown";
import { opportunitiesPageSchema } from "@/lib/content/schemas";
import {
  InfoCircleIcon,
  EmailIcon,
  SummerIcon,
  GraduationCapIcon,
  UserGraduateIcon,
  FlaskIcon,
  BriefcaseIcon,
  HandsHelpingIcon,
  ExternalLinkIcon,
} from "@/components/icons";

export const revalidate = 10;

const ICONS = {
  sun: SummerIcon,
  "graduation-cap": GraduationCapIcon,
  "user-graduate": UserGraduateIcon,
  flask: FlaskIcon,
  briefcase: BriefcaseIcon,
  "hands-helping": HandsHelpingIcon,
} as const;

const DESCRIPTION =
  "Join Spectrum Lab - PhD, MTech, internship and project positions available for exceptional students at IISc Bangalore";

export const metadata: Metadata = {
  title: "Opportunities",
  description: DESCRIPTION,
  alternates: { canonical: "/opportunities/" },
};

export default async function OpportunitiesPage() {
  const page = await readPage("opportunities", opportunitiesPageSchema);
  const [bodyHtml, applicationHtml, readyToApplyHtml] = await Promise.all([
    renderMarkdown(page.body),
    renderMarkdown(page.applicationProcess),
    renderMarkdown(page.readyToApply),
  ]);
  const positionBodies = await Promise.all(page.positions.map((p) => renderMarkdown(p.body)));

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">Opportunities</h1>
        <h2 className="post-description">{DESCRIPTION}</h2>
      </header>
      <article>
        <div className="opportunities">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />

                <div className="alert alert-info" role="alert">
                  <InfoCircleIcon size={14} /> <strong>Required Skills:</strong> If you are exceptionally good in at
                  least one of the following skills, you might be a good fit for our lab:
                  <ul className="mt-2">
                    {page.requiredSkills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>

                <div className="alert alert-warning" role="alert">
                  <EmailIcon size={14} /> <strong>Application Process:</strong>
                  <div className="application-process" dangerouslySetInnerHTML={{ __html: applicationHtml }} />
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12">
                <h2>Available Positions</h2>
              </div>
            </div>

            <div className="row">
              {page.positions.map((position, i) => {
                const Icon = ICONS[position.icon as keyof typeof ICONS];
                return (
                  <div className="col-md-6 mb-4" key={position.title}>
                    <div className="card h-100">
                      <div className="card-header alert-info text-white">
                        <h3 className="card-title mb-0">
                          {Icon && <Icon size={14} />} {position.title}
                        </h3>
                      </div>
                      <div className="card-body" dangerouslySetInnerHTML={{ __html: positionBodies[i] }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="row mt-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title-2 card-title">
                      <ExternalLinkIcon size={14} /> Additional Resources
                    </h3>
                  </div>
                  <div className="card-body">
                    <p>For more detailed information about modes of entry to IISc, please visit:</p>
                    <ul>
                      {page.additionalResources.map((resource) => (
                        <li key={resource.url}>
                          <a href={resource.url} target="_blank" rel="external nofollow noopener">
                            {resource.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-md-12">
                <div className="alert alert-success" role="alert">
                  <h4 className="alert-heading">🚀 Ready to Apply?</h4>
                  <div dangerouslySetInnerHTML={{ __html: readyToApplyHtml }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
