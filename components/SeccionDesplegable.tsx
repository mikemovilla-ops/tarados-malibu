"use client";

import { useState } from "react";

export default function SeccionDesplegable({
  titulo,
  abiertoInicial = true,
  children,
}: {
  titulo: string;
  abiertoInicial?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  return (
    <section className="space-y-2">
      <button onClick={() => setAbierto((v) => !v)} className="w-full flex items-center justify-between gap-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">{titulo}</h2>
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-chalk/40 shrink-0 transition-transform ${abierto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {abierto && children}
    </section>
  );
}
