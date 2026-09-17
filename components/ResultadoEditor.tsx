"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function ResultadoEditor({
  partidoId,
  golesFavorInicial,
  golesContraInicial,
  golesPropiaPuertaInicial,
  notasIniciales,
}: {
  partidoId: string;
  golesFavorInicial: number | null;
  golesContraInicial: number | null;
  golesPropiaPuertaInicial: number;
  notasIniciales: string | null;
}) {
  const router = useRouter();
  const [golesFavor, setGolesFavor] = useState(golesFavorInicial?.toString() ?? "");
  const [golesContra, setGolesContra] = useState(golesContraInicial?.toString() ?? "");
  const [golesPropiaPuerta, setGolesPropiaPuerta] = useState(golesPropiaPuertaInicial.toString());
  const [notas, setNotas] = useState(notasIniciales ?? "");
  const [guardando, startTransition] = useTransition();
  const [eliminando, startEliminar] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          golesFavor: golesFavor === "" ? null : Number(golesFavor),
          golesContra: golesContra === "" ? null : Number(golesContra),
          golesPropiaPuerta: golesPropiaPuerta === "" ? 0 : Number(golesPropiaPuerta),
          notas: notas === "" ? null : notas,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar el resultado.");
        return;
      }
      router.refresh();
    });
  }

  function eliminar() {
    if (!confirm("¿Seguro que quieres borrar este partido? No se puede deshacer.")) return;
    startEliminar(async () => {
      const res = await fetch(`/api/partidos/${partidoId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/calendario");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={golesFavor}
          onChange={(e) => setGolesFavor(e.target.value)}
          placeholder="Nosotros"
          className="w-20 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
        />
        <span className="text-chalk/40">-</span>
        <input
          type="number"
          min={0}
          value={golesContra}
          onChange={(e) => setGolesContra(e.target.value)}
          placeholder="Rival"
          className="w-20 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
        />
      </div>
      <label className="flex items-center gap-2 text-xs text-chalk/50">
        Goles en propia del rival (a nuestro favor)
        <input
          type="number"
          min={0}
          value={golesPropiaPuerta}
          onChange={(e) => setGolesPropiaPuerta(e.target.value)}
          className="w-16 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
        />
      </label>
      <textarea
        value={notas}
        onChange={(e) => setNotas(e.target.value)}
        placeholder="Notas del partido (opcional)"
        rows={2}
        className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
      />
      {error && <p className="text-coral">{error}</p>}
      <div className="flex items-center justify-between">
        <button onClick={guardar} disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Guardar resultado
        </button>
        <button onClick={eliminar} disabled={eliminando} className="text-coral/80 hover:text-coral text-xs">
          Eliminar partido
        </button>
      </div>
    </div>
  );
}
