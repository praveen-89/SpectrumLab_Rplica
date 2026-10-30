import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCourses } from "@/lib/content/teaching";
import CourseDetail from "@/components/CourseDetail";

async function findCourse(slug: string) {
  const courses = await readCourses();
  return courses.find((course) => course.slug === slug);
}

export async function generateStaticParams() {
  const courses = await readCourses();
  return courses.map((course) => ({ slug: course.slug }));
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
      <header className="post-header">
        <h1 className="post-title">{course.title}</h1>
      </header>
      <article>
        <CourseDetail course={course} />
      </article>
    </div>
  );
}
