import "server-only";
import { cache } from "react";
import { readCollection } from "./collection";
import { courseSchema, type Course } from "./schemas";

export type CourseWithSlug = Course & { slug: string };

export const readCourses = cache(async (): Promise<CourseWithSlug[]> => {
  return readCollection("teaching", courseSchema);
});
