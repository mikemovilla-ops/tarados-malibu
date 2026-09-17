"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function EditarDatosPersonales({
  telefonoInicial,
  dniInicial,
  fechaNacimientoInicial,
}: {
  telefonoInicial: string;
  dniInicial: string;
  fechaNacimientoInicial: string;
}) {
  const router = useRouter();
  const [telefono, setTelefono] = useState(telefonoInicial);
  const [dni, setDni] = useState(dniInicial);
  const [fechaNacimiento, setFechaNacimiento] = useState(fechaNacimientoInicial);
  const [guardando, startTransition] = useTransition();
  const [guardado, setGuardado] = useState(false);

  function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardado(false);
    startTransition(async () => {
      const res = await fetch("/api/usuario/datos-personales", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telefono, dni, fechaNacimiento }),
      });
      if (res.ok) {
        setGuardado(true);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={guardar} className="space-y-2 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <label className="space-y-1 col-span-2">
          <span className="text-chalk/60 text-xs">Teléfono</span>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">DNI</span>
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Fecha de nacimiento</span>
          <input
            type="date"
            value={fechaNacimiento}
            onChange={(e) => setFechaNacimiento(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
      </div>
      <div className="flex items-center gap-2">
        <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Guardar
        </button>
        {guardado && <span className="text-amarillobrillante text-xs">Guardado ✓</span>}
      </div>
    </form>
  );
}
