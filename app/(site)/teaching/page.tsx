import type { Metadata } from "next";
import { readCourses } from "@/lib/content/teaching";
import CourseCard from "@/components/CourseCard";
import { BookIcon, BoltIcon } from "@/components/icons";

export const revalidate = 10;

export const metadata: Metadata = {
  title: "Teaching",
  description: "Repository of course material",
  alternates: { canonical: "/teaching/" },
};

export default async function TeachingPage() {
  const courses = await readCourses();
  const regular = courses.filter((c) => c.section === "regular");
  const short = courses.filter((c) => c.section === "short");

  return (
    <div className="post">
      <header className="post-header">
        <h1 className="post-title">Teaching</h1>
        <h2 className="post-description">Repository of course material</h2>
      </header>
      <article>
        <div className="teaching-wrapper">
          <div className="container-md py-4">
            {regular.length > 0 && (
              <section className="course-section">
                <div className="section-label">
                  <div className="section-label__icon">
                    <BookIcon size={16} />
                  </div>
                  <span className="section-label__text">Regular Course</span>
                </div>
                <div className="teaching-grid teaching-grid--courses">
                  {regular.map((course) => (
                    <CourseCard course={course} key={course.slug} />
                  ))}
                </div>
              </section>
            )}

            {short.length > 0 && (
              <section className="course-section">
                <div className="section-label">
                  <div className="section-label__icon">
                    <BoltIcon size={16} />
                  </div>
                  <span className="section-label__text">Short Course</span>
                </div>
                <div className="teaching-grid teaching-grid--courses">
                  {short.map((course) => (
                    <CourseCard course={course} key={course.slug} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
