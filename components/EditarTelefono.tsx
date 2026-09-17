"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditarTelefono({ telefonoInicial }: { telefonoInicial: string }) {
  const router = useRouter();
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [guardando, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardado(false);
    startTransition(async () => {
      const res = await fetch("/api/usuario/telefono", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono }),
      });
      if (res.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={guardar} className="flex items-center gap-2 text-sm">
      <input
        type="tel"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        placeholder="Tu teléfono"
        className="flex-1 bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
      />
      <button type="submit" disabled={guardando} className="bg-malibu text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
        Guardar
      </button>
      {guardado && <span className="text-malibubright text-xs">Guardado ✓</span>}
    </form>
  );
}
