"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POSICIONES, ETIQUETA_POSICION } from "@/lib/posiciones";
import { ESTADOS, ETIQUETA_ESTADO } from "@/lib/estados";
import { nombreMostrado } from "@/lib/jugadores";
import { formatFechaCorta } from "@/lib/fechas";
import CamisetaJugador from "@/components/CamisetaJugador";

type Jugador = {
  id: string;
  name: string | null;
  apodo: string | null;
  email: string | null;
  dorsal: number | null;
  posicion: string | null;
  estado: string;
  // Solo llegan si quien pide la lista es admin (ver app/plantilla/page.tsx)
  dni?: string | null;
  fechaNacimiento?: Date | null;
};

export default function FilaJugador({ jugador, esAdmin }: { jugador: Jugador; esAdmin: boolean }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [apodo, setApodo] = useState(jugador.apodo ?? "");
  const [dorsal, setDorsal] = useState(jugador.dorsal?.toString() ?? "");
  const [posicion, setPosicion] = useState(jugador.posicion ?? "");
  const [estado, setEstado] = useState(jugador.estado);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/jugadores/${jugador.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apodo: apodo.trim() || null,
          dorsal: dorsal === "" ? null : Number(dorsal),
          posicion: posicion === "" ? null : posicion,
          estado,
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
    <div className="card p-4 flex items-center gap-3">
      <CamisetaJugador dorsal={jugador.dorsal} nombre={nombreMostrado(jugador)} size={72} />
      <div className="flex-1 min-w-0">
        <p className="text-chalk truncate">
          {jugador.dorsal !== null && <span className="text-amarillobrillante font-display">#{jugador.dorsal} </span>}
          {nombreMostrado(jugador)}
        </p>
        <p className="text-chalk/50 text-xs">
          {jugador.posicion ? ETIQUETA_POSICION[jugador.posicion as keyof typeof ETIQUETA_POSICION] : "Sin posición"}
          {!jugador.email && " · Manual"}
        </p>
        {esAdmin && (jugador.dni || jugador.fechaNacimiento) && (
          <p className="text-chalk/40 text-[11px]">
            {jugador.dni && `DNI: ${jugador.dni}`}
            {jugador.dni && jugador.fechaNacimiento && " · "}
            {jugador.fechaNacimiento && `Nacimiento: ${formatFechaCorta(jugador.fechaNacimiento)}`}
          </p>
        )}
      </div>

      {esAdmin && !editando && (
        <button onClick={() => setEditando(true)} className="text-amarillobrillante text-xs hover:underline shrink-0">
          Editar
        </button>
      )}

      {esAdmin && editando && (
        <div className="flex flex-col gap-2 text-xs shrink-0 w-48">
          <input
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            placeholder="Apodo"
            className="bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
          />
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
              className="flex-1 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
            >
              <option value="">Sin posición</option>
              {POSICIONES.map((p) => (
                <option key={p} value={p}>
                  {ETIQUETA_POSICION[p]}
                </option>
              ))}
            </select>
          </div>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
          >
            {ESTADOS.map((e) => (
              <option key={e} value={e}>
                {ETIQUETA_ESTADO[e]}
              </option>
            ))}
          </select>
          {error && <p className="text-coral">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={guardar}
              disabled={guardando}
              className="bg-amarillo text-pitchdark px-2 py-1 rounded disabled:opacity-50"
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
