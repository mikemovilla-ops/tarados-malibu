"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Selector genérico para los dos premios del partido (Jugador Essenzal y
// ¡Vaya día!) — misma mecánica para los dos, solo cambia el campo que se
// manda al PATCH y la etiqueta. Solo entre los convocados: no tiene sentido
// darle el premio a alguien que no jugó. El motivo es un campo de texto
// aparte (como las notas del partido): se guarda al salir del campo, no en
// cada pulsación, para no mandar un PATCH por letra.
export default function PremioPartidoSelector({
  partidoId,
  campoId,
  campoMotivo,
  etiqueta,
  convocados,
  valorInicial,
  motivoInicial,
}: {
  partidoId: string;
  campoId: "jugadorEssenzalId" | "jugadorVayaDiaId";
  campoMotivo: "jugadorEssenzalMotivo" | "jugadorVayaDiaMotivo";
  etiqueta: string;
  convocados: { id: string; nombre: string }[];
  valorInicial: string | null;
  motivoInicial: string | null;
}) {
  const router = useRouter();
  const [valor, setValor] = useState(valorInicial ?? "");
  const [motivo, setMotivo] = useState(motivoInicial ?? "");
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function guardar(cambios: Record<string, string | null>) {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cambios),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1 text-sm">
      <label className="flex items-center gap-2 text-chalk/60">
        {etiqueta}
        <select
          value={valor}
          onChange={(e) => {
            setValor(e.target.value);
            guardar({ [campoId]: e.target.value === "" ? null : e.target.value });
          }}
          disabled={guardando || convocados.length === 0}
          className="flex-1 min-w-0 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
        >
          <option value="">Sin elegir</option>
          {convocados.map((j) => (
            <option key={j.id} value={j.id}>
              {j.nombre}
            </option>
          ))}
        </select>
      </label>
      {valor && (
        <input
          type="text"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          onBlur={() => guardar({ [campoMotivo]: motivo.trim() || null })}
          placeholder="¿Por qué? (opcional)"
          className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk text-xs"
        />
      )}
      {convocados.length === 0 && (
        <p className="text-chalk/40 text-xs">Convoca primero a los jugadores para poder elegirlo.</p>
      )}
      {error && <p className="text-coral text-xs">{error}</p>}
    </div>
  );
}
