"use client";

import { useState } from "react";
import { Collapse } from "react-bootstrap";
import { ChevronDownIcon } from "./icons";

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="collapsible-section mt-5">
      <h3
        className="section-header d-flex justify-content-between align-items-center"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen((isOpen) => !isOpen);
          }
        }}
      >
        <span>{title}</span>
        <ChevronDownIcon size={14} className="collapse-icon" />
      </h3>
      <Collapse in={open}>
        <div className="publications">{children}</div>
      </Collapse>
    </div>
  );
}
