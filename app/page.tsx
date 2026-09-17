import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import { mesActual } from "@/lib/fechas";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const proximoPartido = await prisma.partido.findFirst({
    where: { fecha: { gte: new Date() } },
    orderBy: { fecha: "asc" },
    include: { convocatorias: { include: { user: { select: { name: true } } } } },
  });

  const ultimoPartido = await prisma.partido.findFirst({
    where: { fecha: { lt: new Date() }, golesFavor: { not: null } },
    orderBy: { fecha: "desc" },
  });

  const miConvocatoria =
    userId && proximoPartido
      ? proximoPartido.convocatorias.find((c) => c.userId === userId)
      : null;

  const miCuota =
    userId ? await prisma.cuota.findUnique({ where: { userId_mes: { userId, mes: mesActual() } } }) : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <h1 className="font-display text-3xl">Tarados Malibú</h1>
        <p className="text-chalk/60 text-sm">Fútbol 7</p>
      </div>

      {!session && (
        <div className="card p-6 text-center space-y-3">
          <p className="text-chalk/70">
            Entra con tu cuenta de Google para ver tus convocatorias, tus estadísticas y el estado de tus pagos.
          </p>
          <BotonEntrarGoogle className="bg-malibu text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-malibubright transition inline-block" />
        </div>
      )}

      <section className="card p-5 space-y-3">
        <h2 className="font-display text-lg">Próximo partido</h2>
        {proximoPartido ? (
          <div className="space-y-1">
            <p className="text-chalk">
              {proximoPartido.esLocal ? "Tarados Malibú" : proximoPartido.rival} vs{" "}
              {proximoPartido.esLocal ? proximoPartido.rival : "Tarados Malibú"}
            </p>
            <p className="text-chalk/60 text-sm">{formatFechaHora(proximoPartido.fecha)}</p>
            <p className="text-chalk/60 text-sm">
              {proximoPartido.competicion}
              {proximoPartido.lugar && ` · ${proximoPartido.lugar}`}
            </p>
            {session && (
              <p className="text-sm pt-2">
                {miConvocatoria === undefined || miConvocatoria === null ? (
                  <span className="text-chalk/40">Convocatoria todavía sin decidir</span>
                ) : miConvocatoria.convocado ? (
                  <span className="text-malibubright">✓ Estás convocado</span>
                ) : (
                  <span className="text-chalk/40">No convocado para este partido</span>
                )}
              </p>
            )}
            <Link href={`/calendario/${proximoPartido.id}`} className="inline-block text-malibubright text-sm hover:underline pt-1">
              Ver detalle →
            </Link>
          </div>
        ) : (
          <p className="text-chalk/50 text-sm">No hay ningún partido programado todavía.</p>
        )}
      </section>

      {ultimoPartido && (
        <section className="card p-5 space-y-1">
          <h2 className="font-display text-lg">Último resultado</h2>
          <p className="text-chalk">
            {ultimoPartido.esLocal ? "Tarados Malibú" : ultimoPartido.rival}{" "}
            <span className="font-display text-malibubright">
              {ultimoPartido.esLocal ? ultimoPartido.golesFavor : ultimoPartido.golesContra} -{" "}
              {ultimoPartido.esLocal ? ultimoPartido.golesContra : ultimoPartido.golesFavor}
            </span>{" "}
            {ultimoPartido.esLocal ? ultimoPartido.rival : "Tarados Malibú"}
          </p>
          <p className="text-chalk/60 text-sm">{formatFechaHora(ultimoPartido.fecha)}</p>
        </section>
      )}

      {session && miCuota && !miCuota.pagado && (
        <section className="card p-5 border-coral/40">
          <p className="text-coral text-sm">
            Tienes pendiente la cuota de este mes ({miCuota.importe.toFixed(2)} €).{" "}
            <Link href="/pagos" className="underline">
              Ver pagos
            </Link>
          </p>
        </section>
      )}

      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <Link href="/plantilla" className="card p-4 hover:border-malibu/40 transition">
          Plantilla
        </Link>
        <Link href="/calendario" className="card p-4 hover:border-malibu/40 transition">
          Calendario
        </Link>
        <Link href="/estadisticas" className="card p-4 hover:border-malibu/40 transition">
          Estadísticas
        </Link>
        <Link href="/pagos" className="card p-4 hover:border-malibu/40 transition">
          Pagos
        </Link>
      </div>
    </div>
  );
}
