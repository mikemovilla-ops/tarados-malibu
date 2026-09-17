"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POSICIONES, ETIQUETA_POSICION } from "@/lib/posiciones";
import { ESTADOS, ETIQUETA_ESTADO } from "@/lib/estados";
import Modal from "@/components/Modal";

export default function FormNuevoJugadorManual() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [dorsal, setDorsal] = useState("");
  const [posicion, setPosicion] = useState("");
  const [estado, setEstado] = useState<string>("AYUDA");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/jugadores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          dorsal: dorsal === "" ? null : Number(dorsal),
          posicion: posicion === "" ? null : posicion,
          estado,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo crear el jugador.");
        return;
      }
      setNombre("");
      setDorsal("");
      setPosicion("");
      setEstado("AYUDA");
      setAbierto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded-md hover:bg-amarillobrillante transition text-sm"
      >
        + Añadir jugador
      </button>
      {abierto && (
        <Modal titulo="Añadir jugador" onClose={() => setAbierto(false)}>
          <form onSubmit={crear} className="space-y-3 text-sm">
            <p className="text-chalk/50 text-xs">
              Para jugadores que no van a entrar con Google (o todavía no lo han hecho). Si luego entra por su
              cuenta, tendrás dos fichas suyas — mejor usar esto solo cuando de verdad no vaya a loguearse.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 col-span-2">
                <span className="text-chalk/60 text-xs">Nombre</span>
                <input
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
                />
              </label>
              <label className="space-y-1">
                <span className="text-chalk/60 text-xs">Dorsal (opcional)</span>
                <input
                  type="number"
                  value={dorsal}
                  onChange={(e) => setDorsal(e.target.value)}
                  className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
                />
              </label>
              <label className="space-y-1">
                <span className="text-chalk/60 text-xs">Posición (opcional)</span>
                <select
                  value={posicion}
                  onChange={(e) => setPosicion(e.target.value)}
                  className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
                >
                  <option value="">Sin posición</option>
                  {POSICIONES.map((p) => (
                    <option key={p} value={p}>
                      {ETIQUETA_POSICION[p]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-1 col-span-2">
                <span className="text-chalk/60 text-xs">Va a</span>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
                >
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {ETIQUETA_ESTADO[e]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {error && <p className="text-coral">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
                Crear jugador
              </button>
              <button type="button" onClick={() => setAbierto(false)} className="text-chalk/60 px-3 py-1.5">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
