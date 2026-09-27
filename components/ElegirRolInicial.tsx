"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ElegirRolInicial() {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();
  const [eligiendo, setEligiendo] = useState<"JUGADOR" | "NO_JUGADOR" | null>(null);

  function elegir(rol: "JUGADOR" | "NO_JUGADOR") {
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
        <h2 className="font-display text-base">¿Eres jugador?</h2>
        <p className="text-chalk/50 text-xs pt-1">
          Si juegas, entras en las convocatorias, respondes disponibilidad y sales en las estadísticas. Si no, puedes
          ver igual la plantilla, el calendario, las estadísticas y el foro, pero para poder abrir temas o responder
          en el foro hace falta pagar la cuota de socio (la puedes ver y pagar en Pagos) — en cuanto el admin la
          registre como pagada, pasas a ser socio. Si te equivocas, el admin lo puede corregir luego desde Plantilla.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => elegir("JUGADOR")}
          disabled={guardando}
          className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded disabled:opacity-50"
        >
          {eligiendo === "JUGADOR" ? "Guardando..." : "Sí, soy jugador"}
        </button>
        <button
          onClick={() => elegir("NO_JUGADOR")}
          disabled={guardando}
          className="bg-pitchdark border border-chalk/20 text-chalk px-3 py-1.5 rounded disabled:opacity-50"
        >
          {eligiendo === "NO_JUGADOR" ? "Guardando..." : "No, no soy jugador"}
        </button>
      </div>
    </section>
  );
}
