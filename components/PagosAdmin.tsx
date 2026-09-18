"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export function FormImportePago({ seccionId, importeInicial }: { seccionId: string; importeInicial: number }) {
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
        body: JSON.stringify({ seccionId, importe: Number(importe) }),
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

export function TogglePago({ userId, seccionId, pagadoInicial }: { userId: string; seccionId: string; pagadoInicial: boolean }) {
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
        body: JSON.stringify({ userId, seccionId, pagado: nuevo }),
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

export function FormNuevaSeccion() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [importe, setImporte] = useState("0");
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function crear(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/pagos/secciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, importe: Number(importe) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo crear la sección.");
        return;
      }
      setNombre("");
      setImporte("0");
      setAbierto(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="bg-amarillo text-pitchdark font-medium px-3 py-1.5 rounded-md hover:bg-amarillobrillante transition text-sm"
      >
        + Nueva sección
      </button>
      {abierto && (
        <Modal titulo="Nueva sección de pago" onClose={() => setAbierto(false)}>
          <form onSubmit={crear} className="space-y-3 text-sm">
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Nombre</span>
              <input
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="p.ej. Torneo de verano"
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            <label className="space-y-1 block">
              <span className="text-chalk/60 text-xs">Importe (€)</span>
              <input
                type="number"
                min={0}
                step={0.5}
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
              />
            </label>
            {error && <p className="text-coral">{error}</p>}
            <div className="flex gap-2">
              <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
                Crear sección
              </button>
              <button type="button" onClick={() => setAbierto(false)} className="text-chalk/60 px-3 py-1.5">
                Cancelar
              </button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
