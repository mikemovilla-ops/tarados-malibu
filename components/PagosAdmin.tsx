"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FormImportePago({ tipo, importeInicial }: { tipo: string; importeInicial: number }) {
  const router = useRouter();
  const [importe, setImporte] = useState(importeInicial.toString());
  const [guardando, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardado(false);
    startTransition(async () => {
      const res = await fetch("/api/pagos/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo, importe: Number(importe) }),
      });
      if (res.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={guardar} className="flex items-center gap-2 text-sm">
      <label className="text-chalk/60">Importe (€)</label>
      <input
        type="number"
        min={0}
        step={0.5}
        value={importe}
        onChange={(e) => setImporte(e.target.value)}
        className="w-24 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
      />
      <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1 rounded disabled:opacity-50">
        Guardar
      </button>
      {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
    </form>
  );
}

export function TogglePago({ userId, tipo, pagadoInicial }: { userId: string; tipo: string; pagadoInicial: boolean }) {
  const router = useRouter();
  const [pagado, setPagado] = useState(pagadoInicial);
  const [guardando, startTransition] = useTransition();

  function alternar() {
    const nuevo = !pagado;
    setPagado(nuevo);
    startTransition(async () => {
      const res = await fetch("/api/pagos", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, tipo, pagado: nuevo }),
      });
      if (!res.ok) {
        setPagado(!nuevo);
        return;
      }
      router.refresh();
    });
  }

  return (
    <button
      onClick={alternar}
      disabled={guardando}
      className={`text-xs px-2 py-1 rounded transition ${
        pagado ? "bg-amarillo/20 text-amarillobrillante" : "bg-coral/20 text-coral"
      }`}
    >
      {pagado ? "Pagado" : "Pendiente"}
    </button>
  );
}
