"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import CamposPartido from "@/components/CamposPartido";
import Modal from "@/components/Modal";

export default function FormNuevoPartido() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [fecha, setFecha] = useState("");
  const [rival, setRival] = useState("");
  const [esLocal, setEsLocal] = useState(true);
  const [competicion, setCompeticion] = useState("Liga");
  const [jornada, setJornada] = useState("");
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
        body: JSON.stringify({
          fecha,
          rival,
          esLocal,
          competicion,
          jornada: jornada === "" ? null : Number(jornada),
          lugar,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "No se pudo crear el partido.");
        return;
      }
      setFecha("");
      setRival("");
      setJornada("");
      setLugar("");
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
        + Nuevo partido
      </button>
      {abierto && (
        <Modal titulo="Nuevo partido" onClose={() => setAbierto(false)}>
          <form onSubmit={crear} className="space-y-3 text-sm">
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
              <button type="submit" disabled={guardando} className="bg-amarillo text-pitchdark px-3 py-1.5 rounded disabled:opacity-50">
                Crear partido
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
