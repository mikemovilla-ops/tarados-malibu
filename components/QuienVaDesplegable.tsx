"use client";

import { useState } from "react";
import CompartirWhatsapp from "@/components/CompartirWhatsapp";

// Desplegable compacto (plegado por defecto) con el detalle de quién va,
// quién no, quién no ha respondido y quién va a la pizzería — pensado para
// no saturar la cajita de "Próximo partido" de la home con listas de
// nombres que la mayoría de las veces no hace falta mirar. Para el admin,
// aquí dentro también está el botón de preparar el mensaje de WhatsApp.
export default function QuienVaDesplegable({
  grupos,
  whatsapp,
}: {
  grupos: { etiqueta: string; nombres: string[]; color?: string }[];
  whatsapp?: { partidoId: string; rival: string; esLocal: boolean; fechaTexto: string; pendientes: string[] };
}) {
  const [abierto, setAbierto] = useState(false);
  const gruposConGente = grupos.filter((g) => g.nombres.length > 0);
  if (gruposConGente.length === 0 && !whatsapp) return null;

  return (
    <div className="pt-1">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="text-chalk/50 text-xs hover:text-chalk/70 transition flex items-center gap-1"
      >
        <svg
          viewBox="0 0 24 24"
          width="12"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
        {abierto ? "Ocultar detalles" : "Ver detalles"}
      </button>
      {abierto && (
        <div className="pt-2 space-y-2">
          <div className="space-y-1 text-sm">
            {gruposConGente.map((g) => (
              <p key={g.etiqueta} className={g.color ?? "text-chalk/60"}>
                <span className="text-chalk/40">
                  {g.etiqueta} ({g.nombres.length}):
                </span>{" "}
                {g.nombres.join(", ")}
              </p>
            ))}
          </div>
          {whatsapp && <CompartirWhatsapp {...whatsapp} />}
        </div>
      )}
    </div>
  );
}
