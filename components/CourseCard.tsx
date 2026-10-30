import Link from "next/link";
import type { CourseWithSlug } from "@/lib/content/teaching";
import { UserIcon, UsersIcon, ArrowRightIcon } from "./icons";

export default function CourseCard({ course }: { course: CourseWithSlug }) {
  return (
    <article className="course-card minimal-card minimal-card--interactive">
      <header className="course-card__header">
        <h3 className="course-card__title">
          <Link href={`/teaching/${course.slug}/`} className="text-reset">
            {course.code ? `${course.code} ${course.title}` : course.title}
          </Link>
        </h3>
        {course.term && <span className="pill pill--muted">{course.term}</span>}
      </header>
      {course.description && <p className="course-card__desc">{course.description}</p>}
      <footer className="course-card__meta">
        {course.instructor && (
          <div className="meta-row">
            <UserIcon size={14} />
            <span>
              {course.instructor.prefix && `${course.instructor.prefix} `}
              {course.instructor.href ? (
                <a href={course.instructor.href} className="coauthor-link">
                  {course.instructor.name}
                </a>
              ) : (
                course.instructor.name
              )}
            </span>
          </div>
        )}
        {course.tas && (
          <div className="meta-row">
            <UsersIcon size={14} />
            <span>{course.tas}</span>
          </div>
        )}
      </footer>
      <div className="course-card__arrow">
        <ArrowRightIcon size={14} />
      </div>
    </article>
  );
}
