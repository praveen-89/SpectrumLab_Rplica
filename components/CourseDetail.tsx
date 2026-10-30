import type { CourseWithSlug } from "@/lib/content/teaching";
import { renderMarkdown } from "@/lib/content/markdown";
import {
  UserIcon,
  CalendarIcon,
  UsersIcon,
  UserFriendsIcon,
  ClockIcon,
  BookIcon,
  PenIcon,
  ExternalLinkIcon,
  DesktopIcon,
  ArrowRightIcon,
} from "./icons";

const SECTION_ICON = { lecture: BookIcon, assignment: PenIcon, resource: ExternalLinkIcon } as const;

export default async function CourseDetail({ course }: { course: CourseWithSlug }) {
  const bodyHtml = course.body ? await renderMarkdown(course.body) : "";

  return (
    <div className="course-wrapper">
      <div className="container-md py-4">
        <header className="course-header">
          {course.description && (
            <div className="course-syllabus">
              <p className="course-header__desc">{course.description}</p>
            </div>
          )}
          <div className="course-header__meta">
            {course.instructor && (
              <span className="pill pill--accent">
                <UserIcon size={12} />
                {course.instructor.prefix && `${course.instructor.prefix} `}
                {course.instructor.href ? (
                  <a href={course.instructor.href} className="coauthor-link">
                    {course.instructor.name}
                  </a>
                ) : (
                  course.instructor.name
                )}
              </span>
            )}
            {course.term && (
              <span className="pill pill--muted">
                <CalendarIcon size={12} />
                {course.term}
              </span>
            )}
            {course.tas && (
              <span className="pill pill--muted">
                <UsersIcon size={12} />
                TAs: {course.tas}
              </span>
            )}
            {course.host && (
              <span className="pill pill--muted">
                <UserFriendsIcon size={12} />
                Hosts: {course.host}
              </span>
            )}
          </div>
        </header>

        {course.schedule.length > 0 && (
          <section className="content-section">
            <div className="section-label">
              <div className="section-label__icon">
                <ClockIcon size={16} />
              </div>
              <span className="section-label__text">Schedule</span>
            </div>
            <div className="minimal-card minimal-card--elevated">
              <div className="logistics-grid">
                {course.schedule.map((item) => (
                  <div className="logistics-item" key={item.label}>
                    <span className="logistics-item__label">{item.label}</span>
                    <span className="logistics-item__value">
                      {item.url ? (
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          {item.value}
                        </a>
                      ) : (
                        item.value
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {course.sections.map((section) => {
          const SectionIcon = SECTION_ICON[section.type];
          return (
            <section className="content-section" key={section.label}>
              <div className="section-label">
                <div className="section-label__icon">
                  <SectionIcon size={16} />
                </div>
                <span className="section-label__text">{section.label}</span>
              </div>
              <div className="teaching-grid teaching-grid--materials">
                {section.items.map((item) => (
                  <article className="material-card" key={item.title}>
                    <div className="material-card__content">
                      <h4 className="material-card__title">{item.title}</h4>
                      {item.description && <p className="material-card__desc">{item.description}</p>}
                    </div>
                    {item.url &&
                      (section.label === "Course Modules" ? (
                        <div className="material-card__actions">
                          <a href={item.url} className="btn-minimal btn-minimal--primary">
                            <ArrowRightIcon size={12} /> View Module
                          </a>
                        </div>
                      ) : (
                        <div className="material-card__actions">
                          <a
                            href={item.url}
                            className={`btn-minimal ${section.type === "lecture" ? "btn-minimal--ghost" : "btn-minimal--primary"}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {section.type === "lecture" ? (
                              <>
                                <DesktopIcon size={12} /> Slides
                              </>
                            ) : (
                              <>
                                <ExternalLinkIcon size={12} /> Open Resource
                              </>
                            )}
                          </a>
                        </div>
                      ))}
                  </article>
                ))}
              </div>
            </section>
          );
        })}

        {bodyHtml && (
          <section className="content-section" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
        )}
      </div>
    </div>
  );
}
