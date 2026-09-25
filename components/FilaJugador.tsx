"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POSICIONES, ETIQUETA_POSICION } from "@/lib/posiciones";
import { ESTADOS, ETIQUETA_ESTADO } from "@/lib/estados";
import { ROLES, ETIQUETA_ROL } from "@/lib/roles";
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
  rol: string;
  // Solo llegan si quien pide la lista es admin (ver app/plantilla/page.tsx)
  dni?: string | null;
  fechaNacimiento?: Date | null;
};

// Avatar de un socio (no tiene dorsal, así que no tiene sentido pintarle
// una camiseta) — un círculo simple con la inicial de su nombre.
function AvatarSocio({ nombre }: { nombre: string }) {
  return (
    <div className="w-[72px] h-[72px] rounded-full bg-pitchdark border border-chalk/20 flex items-center justify-center shrink-0">
      <span className="font-display text-2xl text-amarillobrillante">{nombre.charAt(0).toUpperCase()}</span>
    </div>
  );
}

export default function FilaJugador({ jugador, esAdmin }: { jugador: Jugador; esAdmin: boolean }) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [apodo, setApodo] = useState(jugador.apodo ?? "");
  const [dorsal, setDorsal] = useState(jugador.dorsal?.toString() ?? "");
  const [posicion, setPosicion] = useState(jugador.posicion ?? "");
  const [estado, setEstado] = useState(jugador.estado);
  const [rol, setRol] = useState(jugador.rol);
  const [guardando, startTransition] = useTransition();
  const [borrando, startBorrar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function borrar() {
    if (!confirm(`¿Seguro que quieres borrar a ${nombreMostrado(jugador)}? Se perderá todo su historial (convocatorias, goles, pagos). No se puede deshacer.`))
      return;
    startBorrar(async () => {
      const res = await fetch(`/api/jugadores/${jugador.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo borrar.");
      }
    });
  }

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
          rol,
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

  // Mientras se edita, el avatar/camiseta refleja lo que se va escribiendo
  // (sin guardar aún) — incluido el propio rol, para probar cómo queda
  // antes de confirmar el cambio.
  const rolMostrado = editando ? rol : jugador.rol;
  const dorsalCamiseta = editando ? (dorsal === "" ? null : Number(dorsal)) : jugador.dorsal;
  const nombreCamiseta = editando ? apodo.trim() || jugador.name || "Sin nombre" : nombreMostrado(jugador);

  return (
    <div className="card p-4 flex items-center gap-3">
      {rolMostrado === "SOCIO" ? (
        <AvatarSocio nombre={nombreCamiseta} />
      ) : (
        <CamisetaJugador dorsal={dorsalCamiseta} nombre={nombreCamiseta} size={72} />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-chalk truncate">
          {jugador.rol === "JUGADOR" && jugador.dorsal !== null && (
            <span className="text-amarillobrillante font-display">#{jugador.dorsal} </span>
          )}
          {nombreMostrado(jugador)}
        </p>
        <p className="text-chalk/50 text-xs">
          {jugador.rol === "SOCIO"
            ? "Socio"
            : jugador.posicion
              ? ETIQUETA_POSICION[jugador.posicion as keyof typeof ETIQUETA_POSICION]
              : "Sin posición"}
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
          {rol === "JUGADOR" && (
            <>
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
            </>
          )}
          <select
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className="bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {ETIQUETA_ROL[r]}
              </option>
            ))}
          </select>
          {error && <p className="text-coral">{error}</p>}
          <div className="flex items-center justify-between">
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
            <button onClick={borrar} disabled={borrando} className="text-coral/80 hover:text-coral disabled:opacity-50">
              Borrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
