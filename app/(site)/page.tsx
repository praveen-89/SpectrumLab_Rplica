import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { readPage } from "@/lib/content/page";
import { readCollection } from "@/lib/content/collection";
import { readData } from "@/lib/content/data";
import { readPublications, buildPublicationViews } from "@/lib/content/publications";
import { readCoauthors } from "@/lib/content/coauthors";
import { renderMarkdown } from "@/lib/content/markdown";
import { homePageSchema, newsItemSchema, personSchema, funderSchema } from "@/lib/content/schemas";
import NewsList from "@/components/NewsList";
import PublicationEntry from "@/components/PublicationEntry";
import FundingCarousel from "@/components/FundingCarousel";
import { GoogleScholarIcon, GitHubIcon, TwitterIcon, EmailIcon } from "@/components/icons";
import ObfuscatedEmail from "@/components/ObfuscatedEmail";
import { obfuscateEmail } from "@/lib/security/obfuscate";
import { getSite } from "@/lib/site";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
};

export default async function Home() {
  const [home, news, people, funders, publications, coauthors, site] = await Promise.all([
    readPage("home", homePageSchema),
    readCollection("news", newsItemSchema),
    readCollection("people", personSchema),
    readData("funders.json", funderSchema),
    readPublications(),
    readCoauthors(),
    getSite(),
  ]);

  const introHtml = await renderMarkdown(home.body);
  const director = people.find((person) => person.group === "lab-director");
  const directorHref = director ? `/people/${director.slug}/` : undefined;

  const latestNews = [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const recentPublications = publications.slice(0, 5);

  const publicationsWithAuthors = await buildPublicationViews(recentPublications, coauthors, directorHref);

  return (
    <>
      <h1 className="visually-hidden">{site.name}</h1>

      {/* Intro card — hero-section */}
      <div className="hero-section" data-aos="fade-down">
        <div className="container-fluid px-4 py-3">
          <div className="row align-items-center">
            <div className="col-lg-9 col-md-8">
              <div className="hero-content" dangerouslySetInnerHTML={{ __html: introHtml }} />
            </div>
            <div className="col-lg-3 col-md-4 text-center">
              <div className="hero-logos">
                <div className="logo-item">
                  <a href={home.iiscLogoUrl} target="_blank" rel="noopener noreferrer" title="Indian Institute of Science">
                    <span className="iisc-logo-light">
                      <Image
                        src={home.iiscLogoLight}
                        alt="Indian Institute of Science"
                        className="logo-img"
                        width={800}
                        height={748}
                      />
                    </span>
                    <span className="iisc-logo-dark">
                      <Image
                        src={home.iiscLogoDark}
                        alt="Indian Institute of Science"
                        className="logo-img"
                        width={800}
                        height={748}
                      />
                    </span>
                  </a>
                </div>
                <div className="logo-item">
                  <a href={home.eeLogoUrl} target="_blank" rel="noopener noreferrer" title="Department of Electrical Engineering, IISc">
                    <Image
                      src={home.eeLogo}
                      alt="Department of Electrical Engineering"
                      className="logo-img ee-logo"
                      width={256}
                      height={368}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Group photo */}
      <div className="row mt-4" data-aos="fade-down">
        <div className="col-sm mt-3 mt-md-0">
          <Image
            src={home.groupPhoto}
            alt="Spectrum Lab members"
            className="img-fluid rounded z-depth-1"
            width={800}
            height={263}
            priority
            sizes="(max-width: 768px) 100vw, 930px"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
      </div>
      <div className="caption">{home.groupPhotoCaption}</div>

      {/* Lab Director */}
      {director && directorHref && (
        <div className="lab-director-section" data-aos="fade-down">
          <h2 className="category">Lab Director</h2>
          <div className="row align-items-center">
            <div className="col-md-4 text-center">
              <div className="profile-card">
                <Link href={directorHref}>
                  {director.image && (
                    <Image
                      src={director.image}
                      alt={director.name}
                      className="img-fluid rounded-circle z-depth-1 mb-3 profile-image"
                      width={800}
                      height={800}
                    />
                  )}
                </Link>
                <h2 className="card-title font-weight-bold mb-2">
                  <Link href={directorHref} className="text-decoration-none">
                    {director.name}
                  </Link>
                </h2>
                <div className="card-icons">
                  <ObfuscatedEmail encoded={obfuscateEmail(site.social.email)} title="e-mail" ariaLabel="e-mail">
                    <EmailIcon />
                  </ObfuscatedEmail>
                  {director.links?.scholar && (
                    <a href={director.links.scholar} title="Google Scholar" target="_blank" rel="external nofollow noopener">
                      <GoogleScholarIcon />
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="biography-content">
                <div
                  className="biography-text"
                  dangerouslySetInnerHTML={{
                    __html: await renderMarkdown(director.summary ?? ""),
                  }}
                />
                <p className="read-more-link">
                  <Link href={directorHref} className="btn btn-outline-primary btn-sm">
                    Read Full Profile →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* News */}
      <div data-aos="fade-down">
        <h2>
          <Link href="/news/" style={{ color: "inherit" }}>
            News
          </Link>
        </h2>
        <hr />
        <NewsList items={latestNews} />
      </div>

      {/* Recent Publications */}
      <div data-aos="fade-down">
        <h2>
          <Link href="/publications/" style={{ color: "inherit" }}>
            Recent Publications
          </Link>
        </h2>
        <hr />
        <div className="publications">
          <ol className="bibliography">
            {publicationsWithAuthors.map(({ publication, authors, abstractHtml }) => (
              <PublicationEntry
                key={publication.key}
                entryKey={publication.key}
                abbr={publication.abbr}
                title={publication.title}
                authors={authors}
                venue={publication.venue}
                year={publication.year}
                month={publication.month}
                doi={publication.doi}
                url={publication.url}
                code={publication.code}
                articlePage={publication.articlePage}
                pdf={publication.pdf}
                abstractHtml={abstractHtml}
                bibtex={publication.bibtex}
              />
            ))}
          </ol>
        </div>
      </div>

      {/* Funding */}
      <div data-aos="fade-down">
        <h2>Funding</h2>
        <hr />
        <div className="funding">
          <div className="container-md">
            <FundingCarousel funders={funders} />
          </div>
        </div>
      </div>

      {/* Social */}
      <div className="social" data-aos="fade-down">
        <div className="contact-icons">
          <ObfuscatedEmail encoded={obfuscateEmail(site.social.email)} title="Email" ariaLabel="Email">
            <EmailIcon size={28} />
          </ObfuscatedEmail>
          <a href={site.social.googleScholarUrl} title="Google Scholar" aria-label="Google Scholar" target="_blank" rel="external nofollow noopener">
            <GoogleScholarIcon size={28} />
          </a>
          <a href={site.social.githubUrl} title="GitHub" aria-label="GitHub" target="_blank" rel="external nofollow noopener">
            <GitHubIcon size={28} />
          </a>
          <a href={site.social.twitterUrl} title="Twitter" aria-label="Twitter" target="_blank" rel="external nofollow noopener">
            <TwitterIcon size={28} />
          </a>
        </div>
      </div>
    </>
  );
}
