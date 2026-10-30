import Image from "next/image";
import type { PersonWithSlug } from "@/lib/content/people";
import { renderMarkdown } from "@/lib/content/markdown";
import { EmailIcon, GoogleScholarIcon, GitHubIcon, LinkedInIcon, GlobeIcon, OrcidIcon, TwitterIcon } from "./icons";

export async function PersonPhotoAndLinks({ person }: { person: PersonWithSlug }) {
  const links = person.links ?? {};
  return (
    <div className="col-md-4 text-center">
      {person.image && (
        <Image
          src={person.image}
          alt={person.name}
          className="img-fluid rounded shadow mb-3"
          style={{ maxHeight: 300 }}
          width={300}
          height={300}
        />
      )}
      <h1 className="mt-3">{person.name}</h1>
      <div className="d-flex flex-wrap justify-content-center gap-3 mt-3 social-icons">
        {links.email && (
          <a href={`mailto:${links.email}`} title="Email" aria-label="Email" className="social-icon">
            <EmailIcon size={20} />
          </a>
        )}
        {links.orcid && (
          <a href={links.orcid} title="ORCID" aria-label="ORCID" className="social-icon" target="_blank" rel="external nofollow noopener">
            <OrcidIcon size={20} />
          </a>
        )}
        {links.scholar && (
          <a
            href={links.scholar}
            title="Google Scholar"
            aria-label="Google Scholar"
            className="social-icon"
            target="_blank"
            rel="external nofollow noopener"
          >
            <GoogleScholarIcon size={20} />
          </a>
        )}
        {links.github && (
          <a href={links.github} title="GitHub" aria-label="GitHub" className="social-icon" target="_blank" rel="external nofollow noopener">
            <GitHubIcon size={20} />
          </a>
        )}
        {links.linkedin && (
          <a
            href={links.linkedin}
            title="LinkedIn"
            aria-label="LinkedIn"
            className="social-icon"
            target="_blank"
            rel="external nofollow noopener"
          >
            <LinkedInIcon size={20} />
          </a>
        )}
        {links.website && (
          <a
            href={links.website}
            title="Personal Website"
            aria-label="Personal Website"
            className="social-icon"
            target="_blank"
            rel="external nofollow noopener"
          >
            <GlobeIcon size={20} />
          </a>
        )}
        {links.twitter && (
          <a href={links.twitter} title="Twitter" aria-label="Twitter" className="social-icon" target="_blank" rel="external nofollow noopener">
            <TwitterIcon size={20} />
          </a>
        )}
      </div>
    </div>
  );
}

export async function BiographyContent({ person }: { person: PersonWithSlug }) {
  const html = await renderMarkdown(person.body);
  return (
    <>
      <h2 className="card-title">Biography</h2>
      <div className="biography-body" dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}

export async function BiographyCard({ person }: { person: PersonWithSlug }) {
  return (
    <div className="card shadow-sm border-0 mb-4">
      <div className="card-body">
        <BiographyContent person={person} />
      </div>
    </div>
  );
}

export default async function PersonProfile({ person }: { person: PersonWithSlug }) {
  return (
    <div className="container my-5">
      <div className="row">
        <PersonPhotoAndLinks person={person} />
        <div className="col-md-8">
          <BiographyCard person={person} />
        </div>
      </div>
    </div>
  );
}
