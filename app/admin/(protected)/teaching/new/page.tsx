import type { Metadata } from "next";
import CourseForm from "@/Admin/frontend/components/CourseForm";
import { createCourse } from "@/Admin/backend/actions/teaching-actions";

export const metadata: Metadata = { title: "Add Course" };

export default function NewCoursePage() {
  return <CourseForm createAction={createCourse} />;
}
