import { Suspense, cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { readCourses } from "@/lib/content/teaching";
import CourseDetail from "@/components/CourseDetail";

export const dynamic = "force-dynamic";

const findCourse = cache(async (slug: string) => {
  const courses = await readCourses();
  return courses.find((course) => course.slug === slug);
});

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
        <Suspense fallback={null}>
          <CourseDetail course={course} />
        </Suspense>
      </article>
    </div>
  );
}
