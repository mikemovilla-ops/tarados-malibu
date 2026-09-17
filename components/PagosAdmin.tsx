"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function FormCuotaMensual({ importeInicial }: { importeInicial: number }) {
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
        body: JSON.stringify({ importe: Number(importe) }),
      });
      if (res.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={guardar} className="flex items-center gap-2 text-sm">
      <label className="text-chalk/60">Cuota mensual (€)</label>
      <input
        type="number"
        min={0}
        step={0.5}
        value={importe}
        onChange={(e) => setImporte(e.target.value)}
        className="w-24 bg-pitchdark border border-chalk/20 rounded px-2 py-1 text-chalk"
      />
      <button type="submit" disabled={guardando} className="bg-malibu text-pitchdark px-3 py-1 rounded disabled:opacity-50">
        Guardar
      </button>
      {guardado && <span className="text-malibubright text-xs">Guardado ✓</span>}
    </form>
  );
}

export function FormGenerarCuotas({ mes }: { mes: string }) {
  const router = useRouter();
  const [generando, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<string | null>(null);

  function generar() {
    setMensaje(null);
    startTransition(async () => {
      const res = await fetch("/api/pagos/generar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mes }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMensaje(data.error ?? "No se pudo generar.");
        return;
      }
      setMensaje(data.creadas > 0 ? `${data.creadas} cuota(s) creada(s).` : "Ya estaban todas generadas.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <button onClick={generar} disabled={generando} className="bg-malibu text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
        Generar cuotas de este mes
      </button>
      {mensaje && <span className="text-chalk/60 text-xs">{mensaje}</span>}
    </div>
  );
}

export function ToggleCuotaPagada({ cuotaId, pagadoInicial }: { cuotaId: string; pagadoInicial: boolean }) {
  const router = useRouter();
  const [pagado, setPagado] = useState(pagadoInicial);
  const [guardando, startTransition] = useTransition();

  function alternar() {
    const nuevo = !pagado;
    setPagado(nuevo);
    startTransition(async () => {
      const res = await fetch(`/api/pagos/${cuotaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pagado: nuevo }),
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
        pagado ? "bg-malibu/20 text-malibubright" : "bg-coral/20 text-coral"
      }`}
    >
      {pagado ? "Pagado" : "Pendiente"}
    </button>
  );
}
