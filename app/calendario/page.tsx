import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatFechaHora, formatHora, horaConvocatoria } from "@/lib/fechas";
import { contarDisponibilidad, contarAyudaPodriaIr, contarAyudaNoVan, ayudaSinResponder } from "@/lib/disponibilidad";
import { getViewer, puedeVerDetalles } from "@/lib/viewer";
import FormNuevoPartido from "@/components/FormNuevoPartido";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";
import SeccionDesplegable from "@/components/SeccionDesplegable";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const { session, userId, esAdmin, rol, estado, necesitaElegirRol } = await getViewer();

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Calendario</h1>
        <p className="text-chalk/60">Entra con Google para verlo.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  // Un socio o "no jugador" ve el calendario (rival, fecha, resultado)
  // pero no quién va a cada partido — eso es solo entre jugadores.
  const noJuega = rol === "SOCIO" || rol === "NO_JUGADOR";
  const puedeResponder = !!session && !noJuega && !necesitaElegirRol;

  const totalActivos = await prisma.user.count({ where: { estado: "ACTIVO" } });
  const jugadoresAyuda = await prisma.user.findMany({
    where: { rol: "JUGADOR", estado: "AYUDA" },
    select: { id: true },
  });

  const partidos = await prisma.partido.findMany({
    orderBy: { fecha: "asc" },
    include: {
      convocatorias: {
        select: { userId: true, disponibilidad: true, user: { select: { estado: true } } },
      },
    },
  });
  // Un partido pasa a "Jugados" cuando el admin cierra su jornada, no
  // cuando pasa su fecha — así uno ya jugado pero pendiente de cerrar
  // (o de corregir algo) se sigue viendo en "Próximos", donde se nota que
  // falta cerrarlo.
  const proximos = partidos.filter((p) => !p.cerrado);
  const pasados = partidos.filter((p) => p.cerrado).reverse();

  const puedeVerDetalle = puedeVerDetalles(rol);

  // Mi pizza (ver AsistenciaPizza) para cada partido de la lista, para no
  // perderla al recargar la página.
  const misPizzas = userId
    ? await prisma.asistenciaPizza.findMany({ where: { userId, partidoId: { in: proximos.map((p) => p.id) } } })
    : [];
  const miPizza = (partidoId: string) => misPizzas.find((pz) => pz.partidoId === partidoId) ?? null;

  function FilaPartido({ p, mostrarDisponibilidad }: { p: (typeof partidos)[number]; mostrarDisponibilidad: boolean }) {
    const jugado = p.golesFavor !== null && p.golesContra !== null;
    // Victoria/empate/derrota es siempre golesFavor vs golesContra, sin
    // importar si jugamos en casa o fuera — eso solo decide qué número va
    // primero al escribir el resultado ("local - visitante").
    const resultado = !jugado
      ? null
      : p.golesFavor! > p.golesContra!
        ? "victoria"
        : p.golesFavor! < p.golesContra!
          ? "derrota"
          : "empate";
    const colorBorde =
      resultado === "victoria"
        ? "border-l-green-500"
        : resultado === "derrota"
          ? "border-l-coral"
          : resultado === "empate"
            ? "border-l-chalk/30"
            : "border-l-transparent";
    const colorResultado =
      resultado === "victoria" ? "text-green-400" : resultado === "derrota" ? "text-coral" : "text-chalk/70";
    const respuestasActivos = p.convocatorias.filter((c) => c.user.estado === "ACTIVO");
    const respuestasAyuda = p.convocatorias.filter((c) => c.user.estado === "AYUDA");
    const conteo = contarDisponibilidad(respuestasActivos, totalActivos);
    const ayudaPodriaIr = contarAyudaPodriaIr(respuestasAyuda);
    const ayudaNoVan = contarAyudaNoVan(respuestasAyuda);
    const ayudaSinContestar = ayudaSinResponder(jugadoresAyuda, respuestasAyuda);
    const miDisponibilidad = userId
      ? p.convocatorias.find((c) => c.userId === userId)?.disponibilidad ?? "SIN_RESPONDER"
      : "SIN_RESPONDER";
    const contenido = (
      <>
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
          {!jugado && (
            <p className="text-chalk/40 text-xs underline">Convocatoria: {formatHora(horaConvocatoria(p.fecha))}</p>
          )}
          {mostrarDisponibilidad && !jugado && (
            <p className="text-chalk/50 text-xs pt-1">
              <span className="text-amarillobrillante">{conteo.VOY} van</span>
              {" · "}
              <span className="text-chalk/60">{conteo.DUDA} dudan</span>
              {" · "}
              <span className="text-coral/80">{conteo.NO_VOY} no van</span>
              {(conteo.SIN_RESPONDER > 0 || ayudaSinContestar.length > 0) && (
                <>
                  {" · "}
                  <span className="text-chalk/40">
                    {conteo.SIN_RESPONDER + ayudaSinContestar.length} sin responder
                    {ayudaSinContestar.length > 0 && ` (${ayudaSinContestar.length} de ayuda)`}
                  </span>
                </>
              )}
              {ayudaPodriaIr > 0 && (
                <>
                  {" · "}
                  <span className="text-chalk/60">{ayudaPodriaIr} podría ir (ayuda)</span>
                </>
              )}
              {ayudaNoVan > 0 && (
                <>
                  {" · "}
                  <span className="text-coral/80">{ayudaNoVan} no van (ayuda)</span>
                </>
              )}
            </p>
          )}
        </div>
        {jugado && (
          <p className={`font-display text-lg shrink-0 ${colorResultado}`}>
            {p.esLocal ? p.golesFavor : p.golesContra} - {p.esLocal ? p.golesContra : p.golesFavor}
          </p>
        )}
      </>
    );

    return (
      <div className={`card p-4 space-y-2 border-l-4 ${colorBorde}`}>

        {puedeVerDetalle ? (
          <Link href={`/calendario/${p.id}`} className="flex items-center justify-between gap-3">
            {contenido}
          </Link>
        ) : (
          <div className="flex items-center justify-between gap-3">{contenido}</div>
        )}
        {mostrarDisponibilidad && !jugado && puedeResponder && (
          <DisponibilidadSelector
            partidoId={p.id}
            disponibilidadInicial={miDisponibilidad}
            esAyuda={estado === "AYUDA"}
            pizzaInicial={miPizza(p.id)}
          />
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
