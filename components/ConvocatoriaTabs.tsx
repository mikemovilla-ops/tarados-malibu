"use client";

import { useState } from "react";
import ConvocatoriaEditor from "@/components/ConvocatoriaEditor";
import AsistenciaSociosEditor from "@/components/AsistenciaSociosEditor";

type Jugador = { id: string; name: string | null; apodo: string | null; dorsal: number | null; estado: string };
type FilaConvocatoria = {
  disponibilidad: string;
  convocado: boolean;
  goles: number;
  asistencias: number;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
  golesEncajados: number;
};
type Socio = { id: string; name: string | null; apodo: string | null };
type EstadoAsistencia = { declarado: boolean; confirmado: boolean };

// La convocatoria de jugadores y la asistencia de socios son dos cosas
// distintas (goles/tarjetas no pintan nada para quien no juega) pero viven
// en el mismo sitio de la página — una pestaña para cada una, en vez de
// una sección aparte para los socios.
export default function ConvocatoriaTabs({
  partidoId,
  jugadores,
  convocatoriaInicial,
  socios,
  asistenciaInicial,
}: {
  partidoId: string;
  jugadores: Jugador[];
  convocatoriaInicial: Record<string, FilaConvocatoria>;
  socios: Socio[];
  asistenciaInicial: Record<string, EstadoAsistencia>;
}) {
  const [tab, setTab] = useState<"jugadores" | "socios">("jugadores");

  return (
    <div className="space-y-3">
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setTab("jugadores")}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === "jugadores" ? "bg-amarillo text-pitchdark" : "bg-pitchdark border border-chalk/20 text-chalk/60"
          }`}
        >
          Jugadores
        </button>
        <button
          onClick={() => setTab("socios")}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === "socios" ? "bg-amarillo text-pitchdark" : "bg-pitchdark border border-chalk/20 text-chalk/60"
          }`}
        >
          Socios
        </button>
      </div>
      {tab === "jugadores" ? (
        <ConvocatoriaEditor partidoId={partidoId} jugadores={jugadores} convocatoriaInicial={convocatoriaInicial} />
      ) : (
        <AsistenciaSociosEditor partidoId={partidoId} socios={socios} asistenciaInicial={asistenciaInicial} />
      )}
    </div>
  );
}
