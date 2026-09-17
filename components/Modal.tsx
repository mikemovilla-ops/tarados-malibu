"use client";

import { useEffect } from "react";

export default function Modal({
  titulo,
  onClose,
  children,
}: {
  titulo: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative card w-full max-w-md max-h-[85vh] overflow-y-auto p-5 space-y-4 bg-pitchdark shadow-xl shadow-black/50">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">{titulo}</h2>
          <button onClick={onClose} className="text-chalk/50 hover:text-chalk text-2xl leading-none px-1">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
