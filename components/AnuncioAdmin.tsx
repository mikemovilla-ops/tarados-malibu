"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AnuncioAdmin({
  textoInicial,
  activoInicial,
}: {
  textoInicial: string;
  activoInicial: boolean;
}) {
  const router = useRouter();
  const [texto, setTexto] = useState(textoInicial);
  const [activo, setActivo] = useState(activoInicial);
  const [guardando, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    startTransition(async () => {
      const res = await fetch("/api/anuncio", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto, activo }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar el anuncio.");
        return;
      }
      setGuardado(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={guardar} className="space-y-2 text-sm">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Anuncio para la home (p.ej. cambio de horario, convocatoria de junta...)"
        rows={3}
        className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
      />
      <label className="flex items-center gap-2 text-chalk/60 text-xs">
        <input type="checkbox" checked={activo} onChange={(e) => setActivo(e.target.checked)} />
        Visible en la home
      </label>
      {error && <p className="text-coral">{error}</p>}
      <div className="flex items-center gap-2">
        <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Guardar
        </button>
        {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
      </div>
    </form>
  );
}
