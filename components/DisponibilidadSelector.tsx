"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const OPCIONES = [
  { valor: "VOY", label: "Voy", claseActivo: "bg-amarillo text-pitchdark" },
  { valor: "DUDA", label: "Duda", claseActivo: "bg-chalk/80 text-pitchdark" },
  { valor: "NO_VOY", label: "No voy", claseActivo: "bg-coral text-pitchdark" },
] as const;

export default function DisponibilidadSelector({
  partidoId,
  disponibilidadInicial,
}: {
  partidoId: string;
  disponibilidadInicial: string;
}) {
  const router = useRouter();
  const [disponibilidad, setDisponibilidad] = useState(disponibilidadInicial);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function elegir(valor: string) {
    const anterior = disponibilidad;
    setError(null);
    setDisponibilidad(valor);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/disponibilidad`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ disponibilidad: valor }),
      });
      if (!res.ok) {
        setDisponibilidad(anterior);
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <div className="flex gap-2">
        {OPCIONES.map((o) => (
          <button
            key={o.valor}
            onClick={() => elegir(o.valor)}
            disabled={guardando}
            className={`flex-1 text-sm py-2 rounded-md transition disabled:opacity-50 ${
              disponibilidad === o.valor ? o.claseActivo : "bg-pitchdark border border-chalk/20 text-chalk/60"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
