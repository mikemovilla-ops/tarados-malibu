import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import { contarDisponibilidad, contarAyudaVan, ayudaSinResponder } from "@/lib/disponibilidad";
import { nombreMostrado } from "@/lib/jugadores";
import { getViewer } from "@/lib/viewer";
import FormNuevoPartido from "@/components/FormNuevoPartido";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";
import SeccionDesplegable from "@/components/SeccionDesplegable";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { session, userId, esAdmin, rol, estado, necesitaElegirRol } = await getViewer();
  // Un socio o "no jugador" ve el calendario (rival, fecha, resultado)
  // pero no quién va a cada partido — eso es solo entre jugadores.
  const noJuega = rol === "SOCIO" || rol === "NO_JUGADOR";
  const puedeResponder = !!session && !noJuega && !necesitaElegirRol;

  const totalActivos = await prisma.user.count({ where: { estado: "ACTIVO" } });
  const jugadoresAyuda = await prisma.user.findMany({
    where: { rol: "JUGADOR", estado: "AYUDA" },
    select: { id: true, name: true, apodo: true },
  });

  const partidos = await prisma.partido.findMany({
    orderBy: { fecha: "asc" },
    include: {
      convocatorias: {
        select: { userId: true, disponibilidad: true, user: { select: { estado: true, name: true, apodo: true } } },
      },
    },
  });
  // Un partido pasa a "Jugados" cuando el admin cierra su jornada, no
  // cuando pasa su fecha — así uno ya jugado pero pendiente de cerrar
  // (o de corregir algo) se sigue viendo en "Próximos", donde se nota que
  // falta cerrarlo.
  const proximos = partidos.filter((p) => !p.cerrado);
  const pasados = partidos.filter((p) => p.cerrado).reverse();

  function FilaPartido({ p, mostrarDisponibilidad }: { p: (typeof partidos)[number]; mostrarDisponibilidad: boolean }) {
    const jugado = p.golesFavor !== null && p.golesContra !== null;
    const respuestasActivos = p.convocatorias.filter((c) => c.user.estado === "ACTIVO");
    const respuestasAyuda = p.convocatorias.filter((c) => c.user.estado === "AYUDA");
    const conteo = contarDisponibilidad(respuestasActivos, totalActivos);
    const ayudaVan = contarAyudaVan(respuestasAyuda);
    const ayudaSinContestar = ayudaSinResponder(jugadoresAyuda, respuestasAyuda);
    const miDisponibilidad = userId
      ? p.convocatorias.find((c) => c.userId === userId)?.disponibilidad ?? "SIN_RESPONDER"
      : "SIN_RESPONDER";
    return (
      <div className="card p-4 space-y-2">
        <Link href={`/calendario/${p.id}`} className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-chalk truncate hover:underline">
              {p.esLocal ? "Tarados Malibú" : p.rival}
              <span className="text-chalk/40 text-xs mx-1.5 align-middle">vs</span>
              {p.esLocal ? p.rival : "Tarados Malibú"}
            </p>
            <p className="text-chalk/50 text-xs">
              {formatFechaHora(p.fecha)} · {p.competicion}
              {p.jornada !== null && ` · Jornada ${p.jornada}`}
            </p>
            {mostrarDisponibilidad && !jugado && (
              <p className="text-chalk/50 text-xs pt-1">
                <span className="text-amarillobrillante">
                  {conteo.VOY + ayudaVan} van{ayudaVan > 0 && ` (${ayudaVan} de ayuda)`}
                </span>
                {" · "}
                <span className="text-chalk/60">{conteo.DUDA} dudan</span>
                {" · "}
                <span className="text-coral/80">{conteo.NO_VOY} no van</span>
                {conteo.SIN_RESPONDER > 0 && (
                  <>
                    {" · "}
                    <span className="text-chalk/40">{conteo.SIN_RESPONDER} sin responder</span>
                  </>
                )}
              </p>
            )}
            {mostrarDisponibilidad && !jugado && ayudaSinContestar.length > 0 && (
              <p className="text-chalk/40 text-xs pt-0.5">
                Ayuda sin responder: {ayudaSinContestar.map((j) => nombreMostrado(j)).join(", ")}
              </p>
            )}
          </div>
          {jugado && (
            <p className="font-display text-lg text-amarillobrillante shrink-0">
              {p.esLocal ? p.golesFavor : p.golesContra} - {p.esLocal ? p.golesContra : p.golesFavor}
            </p>
          )}
        </Link>
        {mostrarDisponibilidad && !jugado && puedeResponder && (
          <DisponibilidadSelector partidoId={p.id} disponibilidadInicial={miDisponibilidad} esAyuda={estado === "AYUDA"} />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Calendario</h1>
        {esAdmin && <FormNuevoPartido />}
      </div>

      <SeccionDesplegable titulo="Próximos" abiertoInicial={true}>
        {proximos.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay partidos programados.</p>
        ) : (
          <div className="space-y-2">
            {proximos.map((p) => (
              <FilaPartido key={p.id} p={p} mostrarDisponibilidad={!noJuega} />
            ))}
          </div>
        )}
      </SeccionDesplegable>

      <SeccionDesplegable titulo="Jugados" abiertoInicial={false}>
        {pasados.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay partidos jugados.</p>
        ) : (
          <div className="space-y-2">
            {pasados.map((p) => (
              <FilaPartido key={p.id} p={p} mostrarDisponibilidad={false} />
            ))}
          </div>
        )}
      </SeccionDesplegable>
    </div>
  );
}
