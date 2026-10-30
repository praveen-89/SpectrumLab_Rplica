"use client";

import { useState } from "react";
import type { RecognitionItem } from "@/lib/content/schemas";
import { UserGraduateIcon } from "./icons";

const FILTERS = [
  { value: "all", label: "All Achievements" },
  { value: "fellowship", label: "Fellowships" },
  { value: "medal", label: "Dissertation & Thesis Medals" },
  { value: "invention", label: "Invention Awards" },
  { value: "other", label: "Other Honors" },
] as const;

const TYPE_LABELS: Record<RecognitionItem["type"], string> = {
  fellowship: "Fellowship",
  medal: "Medal",
  invention: "Invention",
  other: "Award",
};

export default function RecognitionList({ items }: { items: RecognitionItem[] }) {
  const [filter, setFilter] = useState<string>("all");
  const visible = filter === "all" ? items : items.filter((item) => item.type === filter);

  return (
    <>
      <div className="recognition-filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className={`filter-btn${filter === f.value ? " active" : ""}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="recognition-grid">
        {visible.map((item, index) => (
          <div className={`recognition-card ${item.type}`} key={`${item.title}-${index}`}>
            <div className="recognition-card__image-container">
              {item.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element -- a plain decorative photo, not worth Next/Image's fixed-size optimization for a user-contributed, variably-sized gallery of award photos
                <img src={item.images[0]} alt={item.title} loading="lazy" />
              ) : (
                <div className="recognition-card__placeholder">
                  <UserGraduateIcon size={48} />
                </div>
              )}
              {item.images.length > 1 && (
                <span className="photo-count">+{item.images.length - 1} more</span>
              )}
              {item.year && <span className="recognition-card__year">{item.year}</span>}
            </div>
            <div className="recognition-card__body">
              <div className="recognition-card__meta">
                <span className={`category-tag tag-${item.type}`}>{TYPE_LABELS[item.type]}</span>
              </div>
              <h2 className="recognition-card__title">{item.title}</h2>
              <div className="recognition-card__people">
                <UserGraduateIcon size={14} />
                <span>
                  {item.people.map((person, i) => (
                    <span key={person.name}>
                      {i > 0 && ", "}
                      {person.href ? <a href={person.href} className="coauthor-link">{person.name}</a> : person.name}
                    </span>
                  ))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
