"use client";

import { useEffect, useState, useCallback } from "react";

interface ToastMessage {
  id: number;
  text: string;
  type: "success" | "error" | "info";
}

let addToastExternal: ((text: string, type?: ToastMessage["type"]) => void) | null = null;

export function showToast(text: string, type: ToastMessage["type"] = "success") {
  addToastExternal?.(text, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => {
      addToastExternal = null;
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-slide-up ${
            toast.type === "error"
              ? "bg-red-900/90 text-red-200 border border-red-700"
              : toast.type === "info"
                ? "bg-cyan-900/90 text-cyan-200 border border-cyan-700"
                : "bg-green-900/90 text-green-200 border border-green-700"
          }`}
        >
          {toast.text}
        </div>
      ))}
    </div>
  );
}
