import Link from "next/link";
import Image from "next/image";
import type { PersonWithSlug } from "@/lib/content/people";
import { EmailIcon, GoogleScholarIcon, GitHubIcon, LinkedInIcon, GlobeIcon, OrcidIcon, TwitterIcon } from "./icons";
import ObfuscatedEmail from "./ObfuscatedEmail";
import { obfuscateEmail } from "@/lib/security/obfuscate";

export default function PersonCard({ person }: { person: PersonWithSlug }) {
  const href = `/people/${person.slug.replace(/^\/+|\/+$/g, "")}/`;
  const links = person.links ?? {};

  return (
    <div className="grid-item">
      <div className="card hoverable">
        <Link href={href} aria-hidden="true" tabIndex={-1}>
          {person.image && (
            <Image
              src={person.image}
              alt={person.name}
              className="img-fluid rounded-circle z-depth-0"
              width={300}
              height={300}
              sizes="(max-width: 576px) 120px, (max-width: 992px) 180px, 220px"
              loading="lazy"
              style={{ aspectRatio: "1 / 1", objectFit: "cover" }}
            />
          )}
        </Link>
        <h2 className="card-title text-capitalize">
          <Link href={href} className="text-reset text-decoration-none">
            {person.name}
          </Link>
        </h2>
        <div className="card-icons">
          {links.email && (
            <ObfuscatedEmail encoded={obfuscateEmail(links.email)} title="Email" aria-label="Email">
              <EmailIcon size={18} />
            </ObfuscatedEmail>
          )}
          {links.orcid && (
            <a href={links.orcid} title="ORCID" aria-label="ORCID" target="_blank" rel="external nofollow noopener">
              <OrcidIcon size={18} />
            </a>
          )}
          {links.scholar && (
            <a href={links.scholar} title="Google Scholar" aria-label="Google Scholar" target="_blank" rel="external nofollow noopener">
              <GoogleScholarIcon size={18} />
            </a>
          )}
          {links.github && (
            <a href={links.github} title="GitHub" aria-label="GitHub" target="_blank" rel="external nofollow noopener">
              <GitHubIcon size={18} />
            </a>
          )}
          {links.linkedin && (
            <a href={links.linkedin} title="LinkedIn" aria-label="LinkedIn" target="_blank" rel="external nofollow noopener">
              <LinkedInIcon size={18} />
            </a>
          )}
          {links.twitter && (
            <a href={links.twitter} title="Twitter" aria-label="Twitter" target="_blank" rel="external nofollow noopener">
              <TwitterIcon size={18} />
            </a>
          )}
          {links.website && (
            <a href={links.website} title="Personal Website" aria-label="Personal Website" target="_blank" rel="external nofollow noopener">
              <GlobeIcon size={18} />
            </a>
          )}
        </div>
        <div className="card-body" />
      </div>
    </div>
  );
}
