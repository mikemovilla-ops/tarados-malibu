"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { nombreMostrado } from "@/lib/jugadores";

type Jugador = { id: string; name: string | null; apodo: string | null; dorsal: number | null; estado: string };
type Fila = {
  disponibilidad: string;
  convocado: boolean;
  titular: boolean;
  goles: number;
  asistencias: number;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
};

const ETIQUETA_DISPONIBILIDAD: Record<string, string> = {
  VOY: "Voy",
  DUDA: "Duda",
  NO_VOY: "No voy",
  SIN_RESPONDER: "",
};

const CLASE_DISPONIBILIDAD: Record<string, string> = {
  VOY: "text-amarillobrillante",
  DUDA: "text-chalk/60",
  NO_VOY: "text-coral/80",
  SIN_RESPONDER: "",
};

function FilaConvocatoria({
  jugador,
  fila,
  actualizar,
  disponibilidadEditable,
}: {
  jugador: Jugador;
  fila: Fila;
  actualizar: (userId: string, cambios: Partial<Fila>) => void;
  disponibilidadEditable: boolean;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <label className="flex items-center gap-1.5 w-40 shrink-0">
        <input
          type="checkbox"
          checked={fila.convocado}
          onChange={(e) =>
            actualizar(jugador.id, {
              convocado: e.target.checked,
              ...(e.target.checked ? {} : { titular: false, goles: 0, asistencias: 0 }),
            })
          }
        />
        <span className="truncate text-chalk/80">
          {jugador.dorsal !== null && `#${jugador.dorsal} `}
          {nombreMostrado(jugador)}
        </span>
      </label>
      {disponibilidadEditable ? (
        <select
          value={fila.disponibilidad}
          onChange={(e) =>
            actualizar(jugador.id, {
              disponibilidad: e.target.value,
              ...(e.target.value === "VOY" ? { convocado: true } : {}),
            })
          }
          className={`text-[11px] shrink-0 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 ${CLASE_DISPONIBILIDAD[fila.disponibilidad]}`}
        >
          <option value="SIN_RESPONDER">Sin responder</option>
          <option value="VOY">Voy</option>
          <option value="DUDA">Duda</option>
          <option value="NO_VOY">No voy</option>
        </select>
      ) : (
        ETIQUETA_DISPONIBILIDAD[fila.disponibilidad] && (
          <span className={`text-[11px] shrink-0 ${CLASE_DISPONIBILIDAD[fila.disponibilidad]}`}>
            {ETIQUETA_DISPONIBILIDAD[fila.disponibilidad]}
          </span>
        )
      )}
      {fila.convocado && (
        <>
          <label className="flex items-center gap-1 text-xs text-chalk/50">
            <input
              type="checkbox"
              checked={fila.titular}
              onChange={(e) => actualizar(jugador.id, { titular: e.target.checked })}
            />
            Titular
          </label>
          <label className="flex items-center gap-1 text-xs text-chalk/50">
            Goles
            <input
              type="number"
              min={0}
              value={fila.goles}
              onChange={(e) => actualizar(jugador.id, { goles: Number(e.target.value) })}
              className="w-12 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 text-chalk"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-chalk/50">
            Ast.
            <input
              type="number"
              min={0}
              value={fila.asistencias}
              onChange={(e) => actualizar(jugador.id, { asistencias: Number(e.target.value) })}
              className="w-12 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 text-chalk"
            />
          </label>
          <label className="flex items-center gap-1 text-xs text-chalk/50" title="Tarjeta amarilla">
            <input
              type="checkbox"
              checked={fila.tarjetaAmarilla}
              onChange={(e) => actualizar(jugador.id, { tarjetaAmarilla: e.target.checked })}
            />
            🟨
          </label>
          <label className="flex items-center gap-1 text-xs text-chalk/50" title="Tarjeta roja">
            <input
              type="checkbox"
              checked={fila.tarjetaRoja}
              onChange={(e) => actualizar(jugador.id, { tarjetaRoja: e.target.checked })}
            />
            🟥
          </label>
        </>
      )}
    </div>
  );
}

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
      base[j.id] = convocatoriaInicial[j.id] ?? {
        disponibilidad: "SIN_RESPONDER",
        convocado: false,
        titular: false,
        goles: 0,
        asistencias: 0,
        tarjetaAmarilla: false,
        tarjetaRoja: false,
      };
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

  const activos = jugadores.filter((j) => j.estado === "ACTIVO");
  const ayudas = jugadores.filter((j) => j.estado === "AYUDA");

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        {activos.map((j) => (
          <FilaConvocatoria key={j.id} jugador={j} fila={filas[j.id]} actualizar={actualizar} disponibilidadEditable={false} />
        ))}
      </div>

      {ayudas.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <p className="text-chalk/40 text-[11px] uppercase tracking-wide">
            Ayuda — marca "Voy" si confirmas que viene, aunque no haya respondido él mismo
          </p>
          {ayudas.map((j) => (
            <FilaConvocatoria key={j.id} jugador={j} fila={filas[j.id]} actualizar={actualizar} disponibilidadEditable />
          ))}
        </div>
      )}

      {error && <p className="text-coral text-sm">{error}</p>}
      <div className="flex items-center gap-3">
        <button
          onClick={guardar}
          disabled={guardando}
          className="bg-amarillo text-pitchdark text-sm px-3 py-1.5 rounded disabled:opacity-50"
        >
          Guardar convocatoria
        </button>
        {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
      </div>
    </div>
  );
}
