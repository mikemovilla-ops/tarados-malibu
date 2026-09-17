"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POSICIONES, ETIQUETA_POSICION } from "@/lib/posiciones";

type Jugador = {
  id: string;
  name: string | null;
  image: string | null;
  dorsal: number | null;
  posicion: string | null;
  activo: boolean;
};

export default function FilaJugador({ jugador, esAdmin }: { jugador: Jugador; esAdmin: boolean }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [dorsal, setDorsal] = useState(jugador.dorsal?.toString() ?? "");
  const [posicion, setPosicion] = useState(jugador.posicion ?? "");
  const [activo, setActivo] = useState(jugador.activo);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/jugadores/${jugador.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dorsal: dorsal === "" ? null : Number(dorsal),
          posicion: posicion === "" ? null : posicion,
          activo,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      setEditando(false);
      router.refresh();
    });
  }

  return (
    <div className={`card p-4 flex items-center gap-3 ${!jugador.activo ? "opacity-50" : ""}`}>
      {jugador.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={jugador.image} alt={jugador.name ?? "Jugador"} width={40} height={40} className="rounded-full" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-chalk truncate">
          {jugador.dorsal !== null && <span className="text-malibubright font-display">#{jugador.dorsal} </span>}
          {jugador.name ?? "Sin nombre"}
        </p>
        <p className="text-chalk/50 text-xs">
          {jugador.posicion ? ETIQUETA_POSICION[jugador.posicion as keyof typeof ETIQUETA_POSICION] : "Sin posición"}
          {!jugador.activo && " · Baja"}
        </p>
      </div>

      {esAdmin && !editando && (
        <button onClick={() => setEditando(true)} className="text-malibubright text-xs hover:underline shrink-0">
          Editar
        </button>
      )}

      {esAdmin && editando && (
        <div className="flex flex-col gap-2 text-xs shrink-0">
          <div className="flex gap-2">
            <input
              type="number"
              value={dorsal}
              onChange={(e) => setDorsal(e.target.value)}
              placeholder="Dorsal"
              className="w-16 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
            />
            <select
              value={posicion}
              onChange={(e) => setPosicion(e.target.value)}
              className="bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
            >
              <option value="">Sin posición</option>
              {POSICIONES.map((p) => (
                <option key={p} value={p}>
                  {ETIQUETA_POSICION[p]}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 text-chalk/70">
            <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
            Activo en la plantilla
          </label>
          {error && <p className="text-coral">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={guardando}
              className="bg-malibu text-pitchdark px-2 py-1 rounded disabled:opacity-50"
            >
              Guardar
            </button>
            <button onClick={() => setEditando(false)} className="text-chalk/60 px-2 py-1">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
