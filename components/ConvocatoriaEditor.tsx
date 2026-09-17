"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Jugador = { id: string; name: string | null; dorsal: number | null };
type Fila = { convocado: boolean; titular: boolean; goles: number; asistencias: number };

export default function ConvocatoriaEditor({
  partidoId,
  jugadores,
  convocatoriaInicial,
}: {
  partidoId: string;
  jugadores: Jugador[];
  convocatoriaInicial: Record<string, Fila>;
}) {
  const router = useRouter();
  const [filas, setFilas] = useState<Record<string, Fila>>(() => {
    const base: Record<string, Fila> = {};
    for (const j of jugadores) {
      base[j.id] = convocatoriaInicial[j.id] ?? { convocado: false, titular: false, goles: 0, asistencias: 0 };
    }
    return base;
  });
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function actualizar(userId: string, cambios: Partial<Fila>) {
    setGuardado(false);
    setFilas((prev) => ({ ...prev, [userId]: { ...prev[userId], ...cambios } }));
  }

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/convocatoria`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jugadores: jugadores.map((j) => ({ userId: j.id, ...filas[j.id] })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar la convocatoria.");
        return;
      }
      setGuardado(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {jugadores.map((j) => {
          const fila = filas[j.id];
          return (
            <div key={j.id} className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-1.5 w-40 shrink-0">
                <input
                  type="checkbox"
                  checked={fila.convocado}
                  onChange={(e) =>
                    actualizar(j.id, {
                      convocado: e.target.checked,
                      ...(e.target.checked ? {} : { titular: false, goles: 0, asistencias: 0 }),
                    })
                  }
                />
                <span className="truncate text-chalk/80">
                  {j.dorsal !== null && `#${j.dorsal} `}
                  {j.name ?? "Sin nombre"}
                </span>
              </label>
              {fila.convocado && (
                <>
                  <label className="flex items-center gap-1 text-xs text-chalk/50">
                    <input
                      type="checkbox"
                      checked={fila.titular}
                      onChange={(e) => actualizar(j.id, { titular: e.target.checked })}
                    />
                    Titular
                  </label>
                  <label className="flex items-center gap-1 text-xs text-chalk/50">
                    Goles
                    <input
                      type="number"
                      min={0}
                      value={fila.goles}
                      onChange={(e) => actualizar(j.id, { goles: Number(e.target.value) })}
                      className="w-12 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 text-chalk"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs text-chalk/50">
                    Ast.
                    <input
                      type="number"
                      min={0}
                      value={fila.asistencias}
                      onChange={(e) => actualizar(j.id, { asistencias: Number(e.target.value) })}
                      className="w-12 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 text-chalk"
                    />
                  </label>
                </>
              )}
            </div>
          );
        })}
      </div>
      {error && <p className="text-coral text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-malibu text-pitchdark text-sm px-3 py-1.5 rounded disabled:opacity-50"
        >
          Guardar convocatoria
        </button>
        {guardado && <span className="text-malibubright text-xs">Guardado ✓</span>}
      </div>
    </div>
  );
}
