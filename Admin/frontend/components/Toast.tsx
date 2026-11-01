"use client";

import { useState, useCallback } from "react";

export type ToastMessage = { id: number; text: string; kind: "success" | "error" };

/** Local toast queue for a single form/page — auto-dismisses each message after 3s. */
export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((text: string, kind: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, text, kind }]);
    setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return { toasts, showToast };
}

export default function ToastContainer({ toasts }: { toasts: ToastMessage[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="admin-toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`admin-toast ${toast.kind}`} role="status">
          {toast.text}
        </div>
      ))}
    </div>
  );
}
