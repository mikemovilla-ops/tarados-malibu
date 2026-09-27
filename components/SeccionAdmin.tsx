"use client";

import { useState } from "react";

export default function SeccionAdmin({
  eyebrow,
  titulo,
  color = "amarillobrillante",
  abiertoInicial = true,
  children,
}: {
  eyebrow: string;
  titulo: string;
  color?: "amarillobrillante" | "chalk" | "coral";
  abiertoInicial?: boolean;
  children: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const colorClass = { amarillobrillante: "text-amarillobrillante", chalk: "text-chalk", coral: "text-coral" }[color];
  return (
    <section className="card p-4">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="w-full flex items-center justify-between text-left -m-1 p-1 rounded hover:bg-chalk/5 transition-colors"
      >
        <div>
          <p className={`text-[10px] uppercase tracking-[0.15em] ${colorClass}`}>{eyebrow}</p>
          <h2 className="font-display text-lg">{titulo}</h2>
        </div>
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-chalk/40 shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {/* Mismo truco grid-template-rows 0fr/1fr que SeccionDesplegable, para
          que abrir/cerrar anime en vez de aparecer de golpe. */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${abierto ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="pt-3 space-y-3">{children}</div>
        </div>
      </div>
    </section>
  );
}
