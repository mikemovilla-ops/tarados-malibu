"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CamposPartido from "@/components/CamposPartido";

export default function EditarDatosPartido({
  partidoId,
  fechaInicial,
  rivalInicial,
  esLocalInicial,
  competicionInicial,
  jornadaInicial,
  lugarInicial,
}: {
  partidoId: string;
  fechaInicial: string;
  rivalInicial: string;
  esLocalInicial: boolean;
  competicionInicial: string;
  jornadaInicial: string;
  lugarInicial: string;
}) {
  const router = useRouter();
  const [editando, setEditando] = useState(false);
  const [fecha, setFecha] = useState(fechaInicial);
  const [rival, setRival] = useState(rivalInicial);
  const [esLocal, setEsLocal] = useState(esLocalInicial);
  const [competicion, setCompeticion] = useState(competicionInicial);
  const [jornada, setJornada] = useState(jornadaInicial);
  const [lugar, setLugar] = useState(lugarInicial);
  const [error, setError] = useState<string | null>(null);
  const [guardando, startTransition] = useTransition();

  function guardar() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/partidos/${partidoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha,
          rival,
          esLocal,
          competicion,
          jornada: jornada === "" ? null : Number(jornada),
          lugar: lugar || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo guardar.");
        return;
      }
      setEditando(false);
      router.refresh();
    });
  }

  if (!editando) {
    return (
      <button onClick={() => setEditando(true)} className="text-amarillobrillante text-xs hover:underline">
        Editar datos del partido
      </button>
    );
  }

  return (
    <div className="space-y-3 text-sm">
      <CamposPartido
        fecha={fecha}
        setFecha={setFecha}
        rival={rival}
        setRival={setRival}
        esLocal={esLocal}
        setEsLocal={setEsLocal}
        competicion={competicion}
        setCompeticion={setCompeticion}
        jornada={jornada}
        setJornada={setJornada}
        lugar={lugar}
        setLugar={setLugar}
      />
      {error && <p className="text-coral">{error}</p>}
      <div className="flex gap-2">
        <button onClick={guardar} disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
          Guardar cambios
        </button>
        <button onClick={() => setEditando(false)} className="text-chalk/60 px-3 py-1.5">
          Cancelar
        </button>
      </div>
    </div>
  );
}
