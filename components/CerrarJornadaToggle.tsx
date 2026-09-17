"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CerrarJornadaToggle({ partidoId, cerradoInicial }: { partidoId: string; cerradoInicial: boolean }) {
  const router = useRouter();
  const [cerrado, setCerrado] = useState(cerradoInicial);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function alternar() {
    const nuevo = !cerrado;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cerrado: nuevo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo cambiar.");
        return;
      }
      setCerrado(nuevo);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <button
        onClick={alternar}
        disabled={guardando}
        className={`px-3 py-1.5 rounded disabled:opacity-50 ${
          cerrado ? "bg-amarillo/20 text-amarillobrillante" : "bg-pitchdark border border-chalk/20 text-chalk/70"
        }`}
      >
        {cerrado ? "Jornada cerrada ✓" : "Cerrar jornada"}
      </button>
      {cerrado && <span className="text-chalk/40 text-xs">Ya cuenta en estadísticas</span>}
      {error && <span className="text-coral text-xs">{error}</span>}
    </div>
  );
}
