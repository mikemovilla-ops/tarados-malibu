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
        <div className="flex items-center gap-1 text-xs text-chalk/50">
          +
          <button
            type="button"
            onClick={() => guardar(true, Math.max(0, acompanantes - 1))}
            disabled={guardando || acompanantes === 0}
            className="w-5 h-5 flex items-center justify-center rounded bg-pitchdark border border-chalk/20 text-chalk disabled:opacity-30"
          >
            −
          </button>
          <span className="w-4 text-center text-chalk tabular-nums">{acompanantes}</span>
          <button
            type="button"
            onClick={() => guardar(true, acompanantes + 1)}
            disabled={guardando}
            className="w-5 h-5 flex items-center justify-center rounded bg-pitchdark border border-chalk/20 text-chalk disabled:opacity-30"
          >
            +
          </button>
          acompañantes
        </div>
      )}
    </div>
  );
}
