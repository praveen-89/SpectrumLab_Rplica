import { getSite } from "@/lib/site";

// The original's global footer (present on every crawled page, including
// publications/, teaching/, funding/) is copyright + credits only — the
// social icon row seen on the homepage lives in that page's own content,
// not the shared layout, so it isn't reproduced here.
export default async function Footer() {
  const site = await getSite();
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer fixed-bottom footer-popup" role="contentinfo">
      <div className="container footer-content">
        <div className="footer-text">
          <span className="copyright">
            © {year} {site.name}.
          </span>{" "}
          <span className="credits">
            Built with Next.js. Design based on{" "}
            <a href="https://github.com/alshedivat/al-folio" target="_blank" rel="external nofollow noopener">
              al-folio
            </a>
            .
          </span>
        </div>
      </div>
    </footer>
  );
}
