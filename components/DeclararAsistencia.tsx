"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import AsistenciaPizza from "@/components/AsistenciaPizza";

// Un socio se autodeclara "voy a ver este partido" — solo marca intención;
// el admin confirma luego quién vino de verdad (AsistenciaSociosEditor), y
// solo entonces cuenta para poder votar los premios del partido.
export default function DeclararAsistencia({
  partidoId,
  declaradoInicial,
  pizzaInicial,
}: {
  partidoId: string;
  declaradoInicial: boolean;
  pizzaInicial?: { voy: boolean; acompanantes: number } | null;
}) {
  const router = useRouter();
  const [declarado, setDeclarado] = useState(declaradoInicial);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function alternar() {
    const nuevo = !declarado;
    setDeclarado(nuevo);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/asistencia`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ declarado: nuevo }),
      });
      if (!res.ok) {
        setDeclarado(!nuevo);
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <button
        onClick={alternar}
        disabled={guardando}
        className={`text-sm px-3 py-1.5 rounded-md border transition disabled:opacity-50 ${
          declarado
            ? "bg-amarillo/10 border-amarillo/40 text-amarillobrillante"
            : "bg-pitchdark border-chalk/20 text-chalk/70"
        }`}
      >
        {declarado ? "✓ Voy a ver este partido" : "Voy a ver este partido"}
      </button>
      {error && <p className="text-coral text-xs">{error}</p>}
      {declarado && (
        <AsistenciaPizza
          partidoId={partidoId}
          voyInicial={pizzaInicial?.voy ?? false}
          acompanantesInicial={pizzaInicial?.acompanantes ?? 0}
        />
      )}
    </div>
  );
}
