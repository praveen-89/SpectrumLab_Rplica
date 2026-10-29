"use client";

import { Fragment, useState } from "react";
import { FileIcon } from "./icons";

export type PublicationAuthor = {
  name: string;
  href?: string;
  italic?: boolean;
};

export type PublicationEntryProps = {
  entryKey: string;
  abbr?: string;
  title: string;
  authors: PublicationAuthor[];
  venue?: string;
  year: number;
  month?: string;
  doi?: string;
  url?: string;
  code?: string;
  articlePage?: string;
  pdf?: string;
  abstractHtml?: string;
  bibtex: string;
};

function downloadBibtex(key: string, bibtex: string) {
  const blob = new Blob([bibtex], { type: "application/x-bibtex" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${key}.bib`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PublicationEntry({
  entryKey,
  abbr,
  title,
  authors,
  venue,
  year,
  month,
  doi,
  url,
  code,
  articlePage,
  pdf,
  abstractHtml,
  bibtex,
}: PublicationEntryProps) {
  const [showAbstract, setShowAbstract] = useState(false);
  const [showBibtex, setShowBibtex] = useState(false);

  // Derived from the original template's actual behaviour across all 241
  // entries, not a per-entry special case:
  // - "Cite" only shows when a url/html field is present (238/238 match
  //   exactly across the source page — an odd coupling, but an exact one).
  // - "Link" shows for that same url field, except when it's identical to
  //   the DOI-derived link (https://doi.org/<doi>), which the template
  //   treats as redundant and suppresses.
  const showCite = Boolean(url);
  const showLink = Boolean(url) && url !== (doi ? `https://doi.org/${doi}` : undefined);

  return (
    <li>
      <div className="row pub-item" data-year={year} data-type-key={entryKey}>
        {abbr && (
          <div className="col col-sm-2 abbr">
            <abbr className="badge rounded w-100">{abbr}</abbr>
          </div>
        )}
        <div className="col-sm-8">
          <div className="title">
            {articlePage ? (
              <a href={articlePage} className="publication-title-link">
                {title}
              </a>
            ) : (
              title
            )}
          </div>
          <div className="author">
            {authors.map((author, index) => {
              const node = author.href ? <a href={author.href}>{author.name}</a> : author.name;
              const rendered = author.italic ? <em>{node}</em> : node;
              const isLast = index === authors.length - 1;
              const isSecondLast = index === authors.length - 2;
              return (
                <Fragment key={author.name}>
                  {rendered}
                  {!isLast && (isSecondLast ? ", and " : ", ")}
                </Fragment>
              );
            })}
          </div>
          <div className="periodical">
            {venue && <em>In {venue}</em>}, {month ? `${month} ${year}` : year}
          </div>

          <div className="links">
            {abstractHtml && (
              <button type="button" className="btn btn-sm" onClick={() => setShowAbstract((v) => !v)}>
                Abstract
              </button>
            )}
            {doi && (
              <a
                href={`https://doi.org/${doi}`}
                className="btn btn-sm"
                target="_blank"
                rel="external nofollow noopener"
              >
                DOI
              </a>
            )}
            {showCite && (
              <button type="button" className="btn btn-sm" onClick={() => setShowBibtex((v) => !v)}>
                Cite
              </button>
            )}
            <button type="button" className="btn btn-sm" onClick={() => downloadBibtex(entryKey, bibtex)}>
              Download .bib
            </button>
            {showLink && (
              <a href={url} className="btn btn-sm" target="_blank" rel="external nofollow noopener">
                Link
              </a>
            )}
            {code && (
              <a href={code} className="btn btn-sm" target="_blank" rel="external nofollow noopener">
                Code
              </a>
            )}
            {pdf && (
              <a href={pdf} className="btn btn-sm" target="_blank" rel="external nofollow noopener">
                PDF
              </a>
            )}
            {articlePage && (
              <a href={articlePage} className="btn btn-sm article-btn">
                <FileIcon size={14} />
                Article
              </a>
            )}
          </div>

          <div className={`bibtex hidden${showBibtex ? " open" : ""}`}>
            <pre>
              <code>{bibtex}</code>
            </pre>
          </div>

          {abstractHtml && (
            <div
              className={`abstract hidden${showAbstract ? " open" : ""}`}
              dangerouslySetInnerHTML={{ __html: abstractHtml }}
            />
          )}
        </div>
      </div>
    </li>
  );
}
