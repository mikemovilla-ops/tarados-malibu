import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import { contarDisponibilidad, contarAyudaVan } from "@/lib/disponibilidad";
import FormNuevoPartido from "@/components/FormNuevoPartido";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  const totalActivos = await prisma.user.count({ where: { estado: "ACTIVO" } });

  const partidos = await prisma.partido.findMany({
    orderBy: { fecha: "asc" },
    include: { convocatorias: { select: { disponibilidad: true, user: { select: { estado: true } } } } },
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
    return (
      <Link href={`/calendario/${p.id}`} className="card p-4 flex items-center justify-between gap-3 hover:border-amarillo/40 transition">
        <div className="min-w-0">
          <p className="text-chalk truncate">
            {p.esLocal ? "Tarados Malibú" : p.rival} vs {p.esLocal ? p.rival : "Tarados Malibú"}
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
        </div>
        {jugado && (
          <p className="font-display text-lg text-amarillobrillante shrink-0">
            {p.esLocal ? p.golesFavor : p.golesContra} - {p.esLocal ? p.golesContra : p.golesFavor}
          </p>
        )}
      </Link>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Calendario</h1>
        {esAdmin && <FormNuevoPartido />}
      </div>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay partidos programados.</p>
        ) : (
          <div className="space-y-2">
            {proximos.map((p) => (
              <FilaPartido key={p.id} p={p} mostrarDisponibilidad />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Jugados</h2>
        {pasados.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay partidos jugados.</p>
        ) : (
          <div className="space-y-2">
            {pasados.map((p) => (
              <FilaPartido key={p.id} p={p} mostrarDisponibilidad={false} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
