"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Voto de un convocado por quién se merece cada premio del partido — puede
// cambiarlo mientras la jornada siga abierta (ver /api/partidos/[id]/votos).
// El desplegable solo deja preparado el voto; hace falta pulsar el botón
// para que se guarde de verdad, así no se vota sin querer al tocar la lista.
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
  const [seleccion, setSeleccion] = useState(miVotoInicial ?? "");
  const [confirmado, setConfirmado] = useState(miVotoInicial ?? "");
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const hayCambiosSinGuardar = seleccion !== confirmado;

  function confirmar() {
    if (!seleccion) return;
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/votos`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, candidatoId: seleccion }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo votar.");
        return;
      }
      setConfirmado(seleccion);
      router.refresh();
    });
  }

  return (
    <div className="space-y-1 text-sm">
      <label className="flex items-center gap-2 text-chalk/80">
        {etiqueta}
        <select
          value={seleccion}
          onChange={(e) => setSeleccion(e.target.value)}
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
        <button
          onClick={confirmar}
          disabled={guardando || !seleccion || !hayCambiosSinGuardar}
          className="shrink-0 bg-amarillo text-pitchdark text-xs font-medium px-2 py-1.5 rounded disabled:opacity-40"
        >
          {guardando ? "..." : "Confirmar"}
        </button>
      </label>
      {confirmado && !hayCambiosSinGuardar && <p className="text-chalk/40 text-xs">Voto registrado ✓</p>}
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
