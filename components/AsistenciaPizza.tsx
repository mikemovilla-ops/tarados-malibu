"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

// Sale pegado a donde ya dices si vas al partido (DisponibilidadSelector) o
// si vas a verlo (DeclararAsistencia) — nuestro patrocinador es una
// pizzería y es costumbre ir después, esto es solo para echar cuentas de
// cuánta gente aproximada va (jugadores, socios, parejas, hijos...).
// Autoservicio, sin que el admin tenga que confirmar nada.
export default function AsistenciaPizza({
  partidoId,
  voyInicial,
  acompanantesInicial,
}: {
  partidoId: string;
  voyInicial: boolean;
  acompanantesInicial: number;
}) {
  const router = useRouter();
  const [voy, setVoy] = useState(voyInicial);
  const [acompanantes, setAcompanantes] = useState(acompanantesInicial);
  const [guardando, startTransition] = useTransition();

  function guardar(nuevoVoy: boolean, nuevosAcompanantes: number) {
    setVoy(nuevoVoy);
    setAcompanantes(nuevosAcompanantes);
    startTransition(async () => {
      await fetch(`/api/partidos/${partidoId}/pizza`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voy: nuevoVoy, acompanantes: nuevosAcompanantes }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 pt-1 flex-wrap">
      <button
        onClick={() => guardar(!voy, acompanantes)}
        disabled={guardando}
        className={`text-xs px-2 py-1 rounded-md border transition disabled:opacity-50 ${
          voy ? "bg-amarillo/10 border-amarillo/40 text-amarillobrillante" : "bg-pitchdark border-chalk/20 text-chalk/60"
        }`}
      >
        🍕 {voy ? "Voy a la pizzería" : "¿Pizzería después?"}
      </button>
      {voy && (
        <label className="flex items-center gap-1 text-xs text-chalk/50">
          +
          <input
            type="number"
            min={0}
            value={acompanantes}
            onChange={(e) => guardar(true, Number(e.target.value))}
            disabled={guardando}
            className="w-12 bg-pitchdark border border-chalk/20 rounded px-1 py-0.5 text-chalk"
          />
          acompañantes
        </label>
      )}
    </div>
  );
}
