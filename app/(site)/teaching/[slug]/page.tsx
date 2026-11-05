import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCourses } from "@/lib/content/teaching";
import CourseDetail from "@/components/CourseDetail";

export const revalidate = 10;

async function findCourse(slug: string) {
  const courses = await readCourses();
  return courses.find((course) => course.slug === slug);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const course = await findCourse(slug);
  if (!course) return {};
  return {
    title: course.title,
    alternates: { canonical: `/teaching/${slug}/` },
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await findCourse(slug);
  if (!course) notFound();

  return (
    <div className="post">
      <header className="post-header" data-aos="fade-down">
        <h1 className="post-title">{course.title}</h1>
      </header>
      <article>
        <CourseDetail course={course} />
      </article>
    </div>
  );
}
