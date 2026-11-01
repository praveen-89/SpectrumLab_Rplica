"use client";

/** A list of plain-text inputs (authors, tags, ...) with add/remove and optional up/down reordering. */
export default function DynamicList({
  values,
  onChange,
  placeholder,
  addLabel = "Add",
  reorder = false,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  addLabel?: string;
  reorder?: boolean;
}) {
  function updateAt(index: number, value: string) {
    const next = [...values];
    next[index] = value;
    onChange(next);
  }

  function removeAt(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= values.length) return;
    const next = [...values];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="admin-dynamic-list">
      {values.map((value, index) => (
        <div className="admin-dynamic-list-row" key={index}>
          {reorder && (
            <div className="admin-dynamic-list-reorder">
              <button
                type="button"
                className="admin-dynamic-list-icon-btn"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="admin-dynamic-list-icon-btn"
                onClick={() => move(index, 1)}
                disabled={index === values.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
            </div>
          )}
          <input value={value} placeholder={placeholder} onChange={(event) => updateAt(index, event.target.value)} />
          <button type="button" className="admin-dynamic-list-icon-btn" onClick={() => removeAt(index)} aria-label="Remove">
            ✕
          </button>
        </div>
      ))}
      <button type="button" className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => onChange([...values, ""])}>
        {addLabel}
      </button>
    </div>
  );
}
