"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nombreMostrado } from "@/lib/jugadores";

type Socio = { id: string; name: string | null; apodo: string | null };
type Estado = { declarado: boolean; confirmado: boolean };

// El admin confirma qué socios vinieron de verdad a ver el partido — mismo
// patrón que ConvocatoriaEditor: los cambios se quedan en local hasta que
// se pulsa "Guardar", no se manda una petición por cada clic. Puede
// confirmar a cualquier socio aunque no se haya autodeclarado él mismo (ver
// DeclararAsistencia). Solo un socio confirmado puede votar los premios
// del partido.
export default function AsistenciaSociosEditor({
  partidoId,
  socios,
  asistenciaInicial,
}: {
  partidoId: string;
  socios: Socio[];
  asistenciaInicial: Record<string, Estado>;
}) {
  const router = useRouter();
  const [estados, setEstados] = useState<Record<string, Estado>>(() => {
    const base: Record<string, Estado> = {};
    for (const s of socios) {
      base[s.id] = asistenciaInicial[s.id] ?? { declarado: false, confirmado: false };
    }
    return base;
  });
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function marcar(userId: string, confirmado: boolean) {
    setGuardado(false);
    setEstados((prev) => ({ ...prev, [userId]: { ...prev[userId], confirmado } }));
  }

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}/asistencia`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          socios: socios.map((s) => ({ userId: s.id, confirmado: estados[s.id].confirmado })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      setGuardado(true);
      router.refresh();
    });
  }

  if (socios.length === 0) {
    return <p className="text-chalk/50 text-sm">Todavía no hay ningún socio.</p>;
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {socios.map((s) => (
          <label key={s.id} className="flex items-center gap-2 rounded-lg bg-pitchdark/50 p-2.5 text-sm">
            <input
              type="checkbox"
              checked={estados[s.id].confirmado}
              onChange={(e) => marcar(s.id, e.target.checked)}
            />
            <span className="text-chalk/80">{nombreMostrado(s)}</span>
            {estados[s.id].declarado && !estados[s.id].confirmado && (
              <span className="text-chalk/40 text-xs">(dijo que venía)</span>
            )}
          </label>
        ))}
      </div>

      {error && <p className="text-coral text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-amarillo text-pitchdark text-sm px-3 py-1.5 rounded disabled:opacity-50"
        >
          Guardar asistencia
        </button>
        {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
      </div>
    </div>
  );
}
