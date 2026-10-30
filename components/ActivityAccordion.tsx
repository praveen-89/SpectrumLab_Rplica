"use client";

import { Accordion } from "react-bootstrap";
import type { AccordionSection } from "@/lib/content/schemas";
import { ClipboardListIcon, GlobeIcon, StarIcon, PenIcon, CalendarIcon, GraduationCapIcon } from "./icons";

const ICONS = {
  "clipboard-list": ClipboardListIcon,
  globe: GlobeIcon,
  star: StarIcon,
  pen: PenIcon,
  "calendar-alt": CalendarIcon,
  "graduation-cap": GraduationCapIcon,
} as const;

function SectionIcon({ name }: { name?: string }) {
  const Icon = name && name in ICONS ? ICONS[name as keyof typeof ICONS] : undefined;
  return Icon ? <Icon size={14} className="me-2 text-muted" /> : null;
}

export default function ActivityAccordion({ sections }: { sections: AccordionSection[] }) {
  return (
    <Accordion>
      {sections.map((section, index) => (
        <Accordion.Item eventKey={String(index)} key={section.title}>
          <Accordion.Header>
            <SectionIcon name={section.icon} />
            {section.title}
          </Accordion.Header>
          <Accordion.Body>
            {section.groups.map((group, groupIndex) => (
              <div className="activity-group" key={group.label ?? groupIndex}>
                {group.label && (
                  <h6 className="activity-group-label">
                    <SectionIcon name={group.icon} />
                    {group.label}
                    <span className="badge bg-light text-dark ms-1">{group.items.length}</span>
                  </h6>
                )}
                <ul className="list-unstyled activity-list">
                  {group.items.map((item) => (
                    <li className="activity-item" key={`${item.title}-${item.meta}`}>
                      <span className="activity-title">{item.title}</span>
                      {item.meta && <span className="activity-meta">{item.meta}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
