"use client";

import { useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { deleteCourse } from "@/Admin/backend/actions/teaching-actions";

export type CourseRow = { id: string; title: string; code?: string; section: string };

function DeleteButton({ course }: { course: CourseRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deleteCourse(course.id);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete "${course.title}"? This cannot be undone.`} />
    </>
  );
}

export default function CoursesList({ courses }: { courses: CourseRow[] }) {
  const columns: AdminTableColumn<CourseRow>[] = [
    { header: "Code", render: (course) => course.code ?? "—" },
    { header: "Title", render: (course) => course.title },
    { header: "Section", render: (course) => <AdminBadge>{course.section}</AdminBadge> },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Teaching</h1>
          <p>Courses and materials.</p>
        </div>
        <Link href="/admin/teaching/new" className="admin-btn admin-btn-primary">
          Add Course
        </Link>
      </div>
      <AdminTable
        columns={columns}
        rows={courses}
        rowKey={(course) => course.id}
        emptyLabel="courses"
        addHref="/admin/teaching/new"
        actions={(course) => (
          <>
            <Link href={`/admin/teaching/${course.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton course={course} />
          </>
        )}
      />
    </div>
  );
}
