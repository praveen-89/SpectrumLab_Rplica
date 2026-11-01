import type { Metadata } from "next";
import { readPage } from "@/lib/content/page";
import { renderMarkdown } from "@/lib/content/markdown";
import { contactPageSchema } from "@/lib/content/schemas";
import { EmailIcon, GoogleScholarIcon, GitHubIcon, TwitterIcon } from "@/components/icons";
import { getSite } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contactus/" },
};

export default async function ContactPage() {
  const [page, site] = await Promise.all([readPage("contact", contactPageSchema), getSite()]);
  const bodyHtml = await renderMarkdown(page.body);
  const collaboratorsHtml = await renderMarkdown(page.collaborators);

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">Contact</h1>
        <h2 className="post-description"></h2>
      </header>
      <article>
        <div dangerouslySetInnerHTML={{ __html: bodyHtml }} />

        <iframe
          src={page.mapEmbedUrl}
          title="Indian Institute of Science Campus Map"
          className="contact-map"
          allowFullScreen
          loading="lazy"
        />

        <div dangerouslySetInnerHTML={{ __html: collaboratorsHtml }} />

        <h3 className="contact-subheading">Administrative Assistant</h3>
        <p>
          <strong>{page.administrator.name}</strong>
          <br />
          Email: <a href={`mailto:${page.administrator.email}`}>{page.administrator.email}</a>
          {page.administrator.phone && (
            <>
              <br />
              Phone: {page.administrator.phone}
            </>
          )}
        </p>

        <h3 className="contact-subheading">Mailing Address</h3>
        <p>
          {page.address.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>

        <div className="social">
          <div className="contact-icons">
            <a href={`mailto:${site.social.email}`} title="Email" aria-label="Email">
              <EmailIcon />
            </a>
            <a
              href={site.social.googleScholarUrl}
              title="Google Scholar"
              aria-label="Google Scholar"
              target="_blank"
              rel="external nofollow noopener"
            >
              <GoogleScholarIcon />
            </a>
            <a href={site.social.githubUrl} title="GitHub" aria-label="GitHub" target="_blank" rel="external nofollow noopener">
              <GitHubIcon />
            </a>
            <a
              href={site.social.twitterUrl}
              title="Twitter"
              aria-label="Twitter"
              target="_blank"
              rel="external nofollow noopener"
            >
              <TwitterIcon />
            </a>
          </div>
        </div>
      </article>
    </div>
  );
}
