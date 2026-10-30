import "server-only";
import { readCollection } from "./collection";
import { courseSchema, type Course } from "./schemas";

export type CourseWithSlug = Course & { slug: string };

export async function readCourses(): Promise<CourseWithSlug[]> {
  return readCollection("teaching", courseSchema);
}
