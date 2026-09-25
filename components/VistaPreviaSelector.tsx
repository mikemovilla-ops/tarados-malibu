"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

const OPCIONES: { valor: string; etiqueta: string }[] = [
  { valor: "", etiqueta: "Tú (admin)" },
  { valor: "ACTIVO", etiqueta: "Jugador activo" },
  { valor: "AYUDA", etiqueta: "Jugador de ayuda" },
  { valor: "SOCIO_PAGADO", etiqueta: "Socio (cuota pagada)" },
  { valor: "SOCIO_PENDIENTE", etiqueta: "Socio (cuota pendiente)" },
];

export default function VistaPreviaSelector({ actual }: { actual: string }) {
  const router = useRouter();
  const [guardando, startTransition] = useTransition();

  function elegir(valor: string) {
    startTransition(async () => {
      await fetch("/api/dev/vista-previa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ perfil: valor }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      {OPCIONES.map((o) => (
        <button
          key={o.valor}
          onClick={() => elegir(o.valor)}
          disabled={guardando}
          className={`px-2.5 py-1.5 rounded transition disabled:opacity-50 ${
            actual === o.valor ? "bg-amarillo text-pitchdark" : "bg-pitchdark border border-chalk/20 text-chalk/70"
          }`}
        >
          {o.etiqueta}
        </button>
      ))}
    </div>
  );
}
