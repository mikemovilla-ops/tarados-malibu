import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nombreMostrado } from "@/lib/jugadores";
import { formatFechaHora } from "@/lib/fechas";
import { ETIQUETA_POSICION } from "@/lib/posiciones";
import { ETIQUETA_ESTADO } from "@/lib/estados";
import { calcularEstadisticasJugador } from "@/lib/estadisticas";
import { getViewer } from "@/lib/viewer";
import CamisetaJugador from "@/components/CamisetaJugador";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function FichaJugadorPage({ params }: { params: { id: string } }) {
  const { session } = await getViewer();

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Ficha del jugador</h1>
        <p className="text-chalk/60">Entra con Google para ver sus estadísticas.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  const jugador = await prisma.user.findUnique({
    where: { id: params.id },
    select: { id: true, name: true, apodo: true, dorsal: true, posicion: true, estado: true, rol: true },
  });

  // Los socios no juegan, así que no tienen estadísticas que enseñar aquí.
  if (!jugador || jugador.rol !== "JUGADOR") notFound();

  const stats = await calcularEstadisticasJugador(jugador.id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Link href="/plantilla" className="text-chalk/50 text-sm hover:underline">
        ← Plantilla
      </Link>

      <div className="card p-4 flex items-center gap-4">
        <CamisetaJugador dorsal={jugador.dorsal} nombre={nombreMostrado(jugador)} size={80} />
        <div>
          <h1 className="font-display text-2xl">
            {jugador.dorsal !== null && <span className="text-amarillobrillante">#{jugador.dorsal} </span>}
            {nombreMostrado(jugador)}
          </h1>
          <p className="text-chalk/50 text-sm">
            {jugador.posicion ? ETIQUETA_POSICION[jugador.posicion] : "Sin posición"} · {ETIQUETA_ESTADO[jugador.estado]}
          </p>
        </div>
      </div>

      <section className="card p-4">
        <div className="grid grid-cols-5 text-center divide-x divide-chalk/10">
          <div>
            <p className="font-display text-2xl text-chalk">{stats.partidosJugados}</p>
            <p className="text-chalk/50 text-[11px] uppercase tracking-wide">PJ</p>
          </div>
          <div>
            <p className="font-display text-2xl text-amarillobrillante">{stats.goles}</p>
            <p className="text-chalk/50 text-[11px] uppercase tracking-wide">Goles</p>
          </div>
          <div>
            <p className="font-display text-2xl text-chalk">{stats.asistencias}</p>
            <p className="text-chalk/50 text-[11px] uppercase tracking-wide">Asist.</p>
          </div>
          <div>
            <p className="font-display text-2xl text-chalk">{stats.tarjetasAmarillas}</p>
            <p className="text-chalk/50 text-[11px] uppercase tracking-wide">🟨</p>
          </div>
          <div>
            <p className="font-display text-2xl text-coral">{stats.tarjetasRojas}</p>
            <p className="text-chalk/50 text-[11px] uppercase tracking-wide">🟥</p>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Partidos</h2>
        {stats.partidos.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay partidos jugados (con la jornada ya cerrada).</p>
        ) : (
          <div className="space-y-2">
            {stats.partidos.map((p) => (
              <Link
                key={p.partidoId}
                href={`/calendario/${p.partidoId}`}
                className="card p-3 flex items-center justify-between gap-3 hover:border-amarillo/40 transition"
              >
                <div className="min-w-0">
                  <p className="text-chalk text-sm truncate">
                    {p.esLocal ? "Tarados Malibú" : p.rival}
                    <span className="text-chalk/40 text-xs mx-1.5">vs</span>
                    {p.esLocal ? p.rival : "Tarados Malibú"}
                  </p>
                  <p className="text-chalk/50 text-xs">
                    {formatFechaHora(p.fecha)} · {p.competicion}
                    {p.jornada !== null && ` · Jornada ${p.jornada}`}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {p.golesFavor !== null && p.golesContra !== null && (
                    <span className="font-display text-amarillobrillante text-sm">
                      {p.esLocal ? p.golesFavor : p.golesContra}-{p.esLocal ? p.golesContra : p.golesFavor}
                    </span>
                  )}
                  {(p.goles > 0 || p.asistencias > 0 || p.tarjetaAmarilla || p.tarjetaRoja) && (
                    <span className="text-xs tracking-wide">
                      {p.goles > 0 && "⚽".repeat(p.goles)}
                      {p.asistencias > 0 && ` ${"🥾".repeat(p.asistencias)}`}
                      {p.tarjetaAmarilla && " 🟨"}
                      {p.tarjetaRoja && " 🟥"}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
