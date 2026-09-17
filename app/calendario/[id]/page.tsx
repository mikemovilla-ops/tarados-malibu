import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora, toInputDatetimeLocal } from "@/lib/fechas";
import { nombreMostrado } from "@/lib/jugadores";
import ConvocatoriaEditor from "@/components/ConvocatoriaEditor";
import ResultadoEditor from "@/components/ResultadoEditor";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";
import EditarDatosPartido from "@/components/EditarDatosPartido";
import CerrarJornadaToggle from "@/components/CerrarJornadaToggle";
import SeccionEditable from "@/components/SeccionEditable";
import ListaConvocados from "@/components/ListaConvocados";

export const dynamic = "force-dynamic";

const ETIQUETA_GRUPO: Record<"VOY" | "DUDA" | "NO_VOY" | "SIN_RESPONDER", string> = {
  VOY: "Van",
  DUDA: "Dudan",
  NO_VOY: "No van",
  SIN_RESPONDER: "Sin responder",
};

export default async function PartidoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  const partido = await prisma.partido.findUnique({
    where: { id: params.id },
    include: {
      convocatorias: { include: { user: { select: { id: true, name: true, apodo: true, dorsal: true, image: true } } } },
    },
  });

  if (!partido) notFound();

  // Se pide siempre (activos y ayuda): el admin puede convocar a cualquiera
  // de los dos grupos, aunque el resumen de disponibilidad de más abajo solo
  // cuente a los activos.
  const jugadores = await prisma.user.findMany({
    orderBy: [{ dorsal: "asc" }, { name: "asc" }],
    select: { id: true, name: true, apodo: true, dorsal: true, estado: true },
  });

  const convocatoriaInicial: Record<
    string,
    {
      disponibilidad: string;
      convocado: boolean;
      goles: number;
      asistencias: number;
      tarjetaAmarilla: boolean;
      tarjetaRoja: boolean;
    }
  > = {};
  for (const c of partido.convocatorias) {
    convocatoriaInicial[c.userId] = {
      disponibilidad: c.disponibilidad,
      convocado: c.convocado,
      goles: c.goles,
      asistencias: c.asistencias,
      tarjetaAmarilla: c.tarjetaAmarilla,
      tarjetaRoja: c.tarjetaRoja,
    };
  }

  const miDisponibilidad = session ? convocatoriaInicial[session.user.id]?.disponibilidad ?? "SIN_RESPONDER" : null;

  const gruposDisponibilidad: Record<"VOY" | "DUDA" | "NO_VOY" | "SIN_RESPONDER", typeof jugadores> = {
    VOY: [],
    DUDA: [],
    NO_VOY: [],
    SIN_RESPONDER: [],
  };
  for (const j of jugadores.filter((j) => j.estado === "ACTIVO")) {
    const estado = (convocatoriaInicial[j.id]?.disponibilidad ?? "SIN_RESPONDER") as keyof typeof gruposDisponibilidad;
    gruposDisponibilidad[estado].push(j);
  }
  // Los de ayuda que el admin ha marcado como "Voy" se suman también al
  // grupo de "Van" (con etiqueta aparte al mostrarlos) — el resto de grupos
  // se quedan solo con activos, como pide el resumen de fuera.
  for (const j of jugadores.filter((j) => j.estado === "AYUDA")) {
    if (convocatoriaInicial[j.id]?.disponibilidad === "VOY") gruposDisponibilidad.VOY.push(j);
  }

  const convocados = partido.convocatorias.filter((c) => c.convocado);
  const jugado = partido.golesFavor !== null && partido.golesContra !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl">
          {partido.esLocal ? "Tarados Malibú" : partido.rival}
          <span className="text-chalk/40 text-sm mx-1.5 align-middle">vs</span>
          {partido.esLocal ? partido.rival : "Tarados Malibú"}
        </h1>
        <p className="text-chalk/60 text-sm">
          {formatFechaHora(partido.fecha)} · {partido.competicion}
          {partido.jornada !== null && ` · Jornada ${partido.jornada}`}
          {partido.lugar && ` · ${partido.lugar}`}
        </p>
        {jugado && (
          <p className="font-display text-3xl text-amarillobrillante pt-2">
            {partido.esLocal ? partido.golesFavor : partido.golesContra} - {partido.esLocal ? partido.golesContra : partido.golesFavor}
          </p>
        )}
        {partido.notas && <p className="text-chalk/60 text-sm pt-1">{partido.notas}</p>}
        {jugado && !partido.cerrado && (
          <p className="text-chalk/40 text-xs pt-1">
            Resultado provisional: las estadísticas se actualizarán cuando el admin cierre la jornada.
          </p>
        )}
        {esAdmin && (
          <div className="pt-2">
            <EditarDatosPartido
              partidoId={partido.id}
              fechaInicial={toInputDatetimeLocal(partido.fecha)}
              rivalInicial={partido.rival}
              esLocalInicial={partido.esLocal}
              competicionInicial={partido.competicion}
              jornadaInicial={partido.jornada?.toString() ?? ""}
              lugarInicial={partido.lugar ?? ""}
            />
          </div>
        )}
      </div>

      {esAdmin && (
        <section className="card p-4 space-y-2">
          <h2 className="font-display text-base">Resultado</h2>
          {partido.cerrado ? (
            <SeccionEditable
              resumen={
                <p className="text-chalk/60 text-sm">
                  Jornada cerrada ✓
                  {jugado && (
                    <>
                      {" — "}
                      {partido.golesFavor} - {partido.golesContra}
                      {partido.golesPropiaPuerta > 0 && ` (${partido.golesPropiaPuerta} en propia)`}
                    </>
                  )}
                </p>
              }
            >
              <ResultadoEditor
                partidoId={partido.id}
                golesFavorInicial={partido.golesFavor}
                golesContraInicial={partido.golesContra}
                golesPropiaPuertaInicial={partido.golesPropiaPuerta}
                notasIniciales={partido.notas}
              />
              <CerrarJornadaToggle partidoId={partido.id} cerradoInicial={partido.cerrado} />
            </SeccionEditable>
          ) : (
            <>
              <ResultadoEditor
                partidoId={partido.id}
                golesFavorInicial={partido.golesFavor}
                golesContraInicial={partido.golesContra}
                golesPropiaPuertaInicial={partido.golesPropiaPuerta}
                notasIniciales={partido.notas}
              />
              <CerrarJornadaToggle partidoId={partido.id} cerradoInicial={partido.cerrado} />
            </>
          )}
        </section>
      )}

      <section className="card p-4 space-y-3">
        <h2 className="font-display text-base">¿Vas?</h2>
        {partido.cerrado ? (
          <p className="text-chalk/40 text-sm">Jornada cerrada — ya no se puede cambiar la respuesta.</p>
        ) : session ? (
          <DisponibilidadSelector partidoId={partido.id} disponibilidadInicial={miDisponibilidad ?? "SIN_RESPONDER"} />
        ) : (
          <p className="text-chalk/50 text-sm">Entra con Google para decir si vas a este partido.</p>
        )}

        <div className="pt-1 space-y-1.5 text-sm">
          {(["VOY", "DUDA", "NO_VOY", "SIN_RESPONDER"] as const).map((estado) => {
            const grupo = gruposDisponibilidad[estado];
            if (grupo.length === 0) return null;
            const ayudaEnGrupo = grupo.filter((j) => j.estado === "AYUDA").length;
            return (
              <p key={estado} className="text-chalk/60">
                <span className="text-chalk/40">
                  {ETIQUETA_GRUPO[estado]} ({grupo.length}
                  {ayudaEnGrupo > 0 && ` · ${ayudaEnGrupo} de ayuda`}):
                </span>{" "}
                {grupo
                  .map((j) => nombreMostrado(j) + (j.estado === "AYUDA" ? " (ayuda)" : ""))
                  .join(", ")}
              </p>
            );
          })}
        </div>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="font-display text-base">Convocatoria {esAdmin && !partido.cerrado ? "" : `(${convocados.length})`}</h2>
        {esAdmin ? (
          partido.cerrado ? (
            <SeccionEditable resumen={<ListaConvocados convocados={convocados} />}>
              <ConvocatoriaEditor partidoId={partido.id} jugadores={jugadores} convocatoriaInicial={convocatoriaInicial} />
            </SeccionEditable>
          ) : (
            <ConvocatoriaEditor partidoId={partido.id} jugadores={jugadores} convocatoriaInicial={convocatoriaInicial} />
          )
        ) : (
          <ListaConvocados convocados={convocados} />
        )}
      </section>
    </div>
  );
}
