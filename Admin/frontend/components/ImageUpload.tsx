"use client";

import { useState, useTransition } from "react";
import { uploadImage } from "@/Admin/backend/actions/upload-actions";

/**
 * File input + thumbnail preview + optional alt/caption text. Uploads
 * immediately on file selection (via the uploadImage Server Action) and
 * reports the resulting Supabase Storage URL back through onChange —
 * callers just hold that URL string in their own form state, same as
 * any other text field. Plain <img> rather than next/image: these are
 * admin-only previews of arbitrary external Storage URLs.
 */
export default function ImageUpload({
  value,
  onChange,
  folder,
  round = false,
  altValue,
  onAltChange,
}: {
  value: string;
  onChange: (url: string) => void;
  folder: string;
  round?: boolean;
  altValue?: string;
  onAltChange?: (alt: string) => void;
}) {
  const [uploading, startUpload] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    startUpload(async () => {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadImage(folder, formData);
      if (result.error) setError(result.error);
      else if (result.url) onChange(result.url);
    });
  }

  return (
    <div className="admin-image-upload">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className={`admin-image-upload-preview ${round ? "round" : ""}`} />
      ) : null}
      <div className="admin-image-upload-controls">
        <input type="file" accept="image/*" onChange={(event) => handleFile(event.target.files?.[0])} disabled={uploading} />
        {uploading && <span className="admin-field-help">Uploading...</span>}
        {error && <span className="admin-field-error">{error}</span>}
        {onAltChange && (
          <input type="text" placeholder="Alt text / caption" value={altValue ?? ""} onChange={(event) => onAltChange(event.target.value)} />
        )}
      </div>
    </div>
  );
}
