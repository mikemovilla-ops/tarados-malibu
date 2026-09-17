"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function FormNuevoPartido() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState("");
  const [rival, setRival] = useState("");
  const [esLocal, setEsLocal] = useState(true);
  const [competicion, setCompeticion] = useState("Liga");
  const [lugar, setLugar] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/partidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fecha, rival, esLocal, competicion, lugar }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo crear el partido.");
        return;
      }
      setFecha("");
      setRival("");
      setLugar("");
      setAbierto(false);
      router.refresh();
    });
  }

  if (!abierto) {
    return (
      <button
        onClick={() => setAbierto(true)}
        className="bg-malibu text-pitchdark font-medium px-3 py-1.5 rounded-md hover:bg-malibubright transition text-sm"
      >
        + Nuevo partido
      </button>
    );
  }

  return (
    <form onSubmit={crear} className="card p-4 space-y-3 text-sm">
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Fecha y hora</span>
          <input
            type="datetime-local"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Rival</span>
          <input
            required
            value={rival}
            onChange={(e) => setRival(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Competición</span>
          <input
            value={competicion}
            onChange={(e) => setCompeticion(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Lugar (opcional)</span>
          <input
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
      </div>
      <label className="flex items-center gap-1.5 text-chalk/70">
        <input type="checkbox" checked={esLocal} onChange={(e) => setEsLocal(e.target.checked)} />
        Jugamos en casa
      </label>
      {error && <p className="text-coral">{error}</p>}
      <div className="flex gap-2">
        <button type="submit" disabled={guardando} className="bg-malibu text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Crear partido
        </button>
        <button type="button" onClick={() => setAbierto(false)} className="text-chalk/60 px-3 py-1.5">
          Cancelar
        </button>
      </div>
    </form>
  );
}
