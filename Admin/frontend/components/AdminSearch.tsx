"use client";

import { IconSearch } from "@tabler/icons-react";

/** Controlled search input — the caller owns the filtering, this is just the styled input. */
export default function AdminSearch({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="admin-search-input-wrap">
      <IconSearch aria-hidden="true" />
      <input
        type="search"
        className="admin-search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  );
}
