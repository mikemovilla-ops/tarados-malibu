"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Voto de un convocado por quién se merece cada premio del partido — puede
// cambiarlo mientras la jornada siga abierta (ver /api/partidos/[id]/votos).
// Al cerrar la jornada, el admin ve el resultado ya contado (o lo decide él
// si hay empate o nadie ha votado, ver PremioPartidoSelector).
export default function VotarPremio({
  partidoId,
  tipo,
  etiqueta,
  candidatos,
  miVotoInicial,
}: {
  partidoId: string;
  tipo: "ESSENZAL" | "VAYA_DIA";
  etiqueta: string;
  candidatos: { id: string; nombre: string }[];
  miVotoInicial: string | null;
}) {
  const router = useRouter();
  const [voto, setVoto] = useState(miVotoInicial ?? "");
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function votar(candidatoId: string) {
    setVoto(candidatoId);
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/votos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, candidatoId }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo votar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1 text-sm">
      <label className="flex items-center gap-2 text-chalk/80">
        {etiqueta}
        <select
          value={voto}
          onChange={(e) => votar(e.target.value)}
          disabled={guardando}
          className="flex-1 min-w-0 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
        >
          <option value="">Tu voto...</option>
          {candidatos.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
