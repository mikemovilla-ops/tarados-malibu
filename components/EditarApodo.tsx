"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { POSICIONES, ETIQUETA_POSICION } from "@/lib/posiciones";

export default function EditarApodo({
  apodoInicial,
  posicionInicial,
}: {
  apodoInicial: string;
  posicionInicial: string;
}) {
  const router = useRouter();
  const [apodo, setApodo] = useState(apodoInicial);
  const [posicion, setPosicion] = useState(posicionInicial);
  const [guardando, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardado(false);
    startTransition(async () => {
      const res = await fetch("/api/usuario/apodo", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apodo, posicion }),
      });
      if (res.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={guardar} className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Apodo</span>
          <input
            value={apodo}
            onChange={(e) => setApodo(e.target.value)}
            placeholder="Cómo quieres que te llamen"
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Posición</span>
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
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Guardar
        </button>
        {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
      </div>
    </form>
  );
}
