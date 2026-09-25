"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ElegirRolInicial() {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [eligiendo, setEligiendo] = useState<"JUGADOR" | "SOCIO" | null>(null);

  function elegir(rol: "JUGADOR" | "SOCIO") {
    setEligiendo(rol);
    startTransition(async () => {
      const res = await fetch("/api/usuario/rol", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rol }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        setEligiendo(null);
      }
    });
  }

  return (
    <section className="card p-5 space-y-3 border-amarillo/40">
      <div>
        <h2 className="font-display text-base">¿Vienes a jugar o eres socio?</h2>
        <p className="text-chalk/50 text-xs pt-1">
          Un jugador entra en las convocatorias y las estadísticas; un socio ve la plantilla, el calendario y el
          tablón, sin jugar. Si te equivocas, el admin lo puede corregir luego desde Plantilla.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => elegir("JUGADOR")}
          disabled={guardando}
          className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded disabled:opacity-50"
        >
          {eligiendo === "JUGADOR" ? "Guardando..." : "Voy a jugar"}
        </button>
        <button
          onClick={() => elegir("SOCIO")}
          disabled={guardando}
          className="bg-pitchdark border border-chalk/20 text-chalk px-3 py-1.5 rounded disabled:opacity-50"
        >
          {eligiendo === "SOCIO" ? "Guardando..." : "Soy socio"}
        </button>
      </div>
    </section>
  );
}
