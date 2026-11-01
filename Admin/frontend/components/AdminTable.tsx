import Link from "next/link";

export type AdminTableColumn<T> = {
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
};

function EmptyIllustration() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 4v16" />
      <circle cx="13.5" cy="13.5" r="2.5" strokeDasharray="2 2" />
    </svg>
  );
}

/**
 * Generic list table: columns (header + per-row render), striped rows,
 * sticky header, row hover, horizontal scroll on narrow screens, and an
 * empty state with an "Add your first X" call to action. `actions`
 * renders arbitrary per-row controls (typically an Edit link + a Delete
 * button wired to a ConfirmDialog) rather than fixed onEdit/onDelete
 * callbacks, since edit is usually a navigation, not a click handler.
 */
export default function AdminTable<T>({
  columns,
  rows,
  rowKey,
  actions,
  emptyLabel,
  addHref,
}: {
  columns: AdminTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  actions?: (row: T) => React.ReactNode;
  emptyLabel: string;
  addHref?: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="admin-table-wrapper">
        <div className="admin-empty-state">
          <EmptyIllustration />
          <span className="admin-empty-state-heading">No {emptyLabel} yet</span>
          {addHref && (
            <Link href={addHref} className="admin-btn admin-btn-primary">
              Add your first {emptyLabel.replace(/s$/, "")}
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.header}>{column.header}</th>
            ))}
            {actions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={column.header} className={column.className}>
                  {column.render(row)}
                </td>
              ))}
              {actions && <td className="admin-table-actions">{actions(row)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
