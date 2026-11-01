"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminSearch from "./AdminSearch";
import AdminTable, { type AdminTableColumn } from "./AdminTable";
import AdminBadge from "./AdminBadge";
import ConfirmDialog, { type ConfirmDialogHandle } from "./ConfirmDialog";
import { PERSON_GROUP_LABELS } from "@/Admin/frontend/slugify";
import { deletePerson } from "@/Admin/backend/actions/people-actions";

export type PersonRow = {
  id: string;
  group: string;
  status: string;
  year: number | null;
  name: string;
  slug: string;
  image?: string;
};

function DeleteButton({ person }: { person: PersonRow }) {
  const [pending, startDelete] = useTransition();
  const confirmRef = useRef<ConfirmDialogHandle>(null);
  const router = useRouter();

  async function handleClick() {
    const confirmed = await confirmRef.current?.open();
    if (!confirmed) return;
    startDelete(async () => {
      await deletePerson(person.id, person.group, person.status, person.year, person.slug);
      router.refresh();
    });
  }

  return (
    <>
      <button type="button" className="admin-btn admin-btn-danger-outline admin-btn-sm" onClick={handleClick} disabled={pending}>
        {pending ? "Deleting..." : "Delete"}
      </button>
      <ConfirmDialog ref={confirmRef} message={`Delete ${person.name}? This cannot be undone.`} />
    </>
  );
}

export default function PeopleList({ people }: { people: PersonRow[] }) {
  const [query, setQuery] = useState("");

  const filtered = people.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()));

  const columns: AdminTableColumn<PersonRow>[] = [
    {
      header: "Photo",
      render: (person) =>
        person.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={person.image} alt="" className="admin-table-photo" />
        ) : (
          <span className="admin-table-photo" />
        ),
    },
    { header: "Name", render: (person) => person.name },
    { header: "Group", render: (person) => PERSON_GROUP_LABELS[person.group] ?? person.group },
    {
      header: "Status",
      render: (person) => <AdminBadge color={person.status === "current" ? "green" : "gray"}>{person.status}</AdminBadge>,
    },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>People</h1>
          <p>Current members and alumni.</p>
        </div>
        <Link href="/admin/people/new" className="admin-btn admin-btn-primary">
          Add Person
        </Link>
      </div>

      <div className="admin-toolbar">
        <AdminSearch value={query} onChange={setQuery} placeholder="Search by name..." />
      </div>

      <AdminTable
        columns={columns}
        rows={filtered}
        rowKey={(person) => person.id}
        emptyLabel="people"
        addHref="/admin/people/new"
        actions={(person) => (
          <>
            <Link href={`/admin/people/${person.id}/edit`} className="admin-btn admin-btn-secondary admin-btn-sm">
              Edit
            </Link>
            <DeleteButton person={person} />
          </>
        )}
      />
    </div>
  );
}
