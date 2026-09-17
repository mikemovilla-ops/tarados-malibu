import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import { TIPOS_PAGO, ETIQUETA_TIPO_PAGO } from "@/lib/pagos";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  // Igual que en /calendario: "próximo" se decide por si está cerrado o no,
  // no por la fecha — así uno ya jugado pero pendiente de cerrar se sigue
  // mostrando aquí en vez de desaparecer sin más.
  const proximoPartido = await prisma.partido.findFirst({
    where: { cerrado: false },
    orderBy: { fecha: "asc" },
    include: { convocatorias: true },
  });

  const ultimoPartido = await prisma.partido.findFirst({
    where: { fecha: { lt: new Date() }, golesFavor: { not: null } },
    orderBy: { fecha: "desc" },
  });

  const miConvocatoria =
    userId && proximoPartido
      ? proximoPartido.convocatorias.find((c) => c.userId === userId)
      : null;

  // Partidos futuros a los que este jugador todavía no ha respondido
  // (voy/no voy/duda) — sin fila de convocatoria, o con fila pero
  // disponibilidad todavía "sin responder".
  const partidosSinResponder = userId
    ? await prisma.partido.findMany({
        where: {
          fecha: { gte: new Date() },
          cerrado: false,
          convocatorias: { none: { userId, disponibilidad: { not: "SIN_RESPONDER" } } },
        },
        orderBy: { fecha: "asc" },
      })
    : [];

  const miUsuario = userId ? await prisma.user.findUnique({ where: { id: userId }, select: { estado: true } }) : null;
  const misPagos = userId && miUsuario?.estado === "ACTIVO" ? await prisma.pago.findMany({ where: { userId } }) : [];
  const tiposPendientes =
    miUsuario?.estado === "ACTIVO"
      ? TIPOS_PAGO.filter((tipo) => !misPagos.find((p) => p.tipo === tipo)?.pagado)
      : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <Image src="/escudo.png" alt="Escudo Tarados Malibú" width={96} height={96} className="mx-auto" priority />
        <h1 className="font-display text-3xl">Tarados Malibú</h1>
        <p className="text-chalk/60 text-sm">Fútbol 7</p>
      </div>

      {!session && (
        <div className="card p-6 text-center space-y-3">
          <p className="text-chalk/70">
            Entra con tu cuenta de Google para ver tus convocatorias, tus estadísticas y el estado de tus pagos.
          </p>
          <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
        </div>
      )}

      <section className="card p-5 space-y-3">
        <h2 className="font-display text-lg">Próximo partido</h2>
        {proximoPartido ? (
          <div className="space-y-1">
            <p className="text-chalk">
              {proximoPartido.esLocal ? "Tarados Malibú" : proximoPartido.rival}
              <span className="text-chalk/40 text-xs mx-1.5 align-middle">vs</span>
              {proximoPartido.esLocal ? proximoPartido.rival : "Tarados Malibú"}
            </p>
            <p className="text-chalk/60 text-sm">{formatFechaHora(proximoPartido.fecha)}</p>
            <p className="text-chalk/60 text-sm">
              {proximoPartido.competicion}
              {proximoPartido.jornada !== null && ` · Jornada ${proximoPartido.jornada}`}
              {proximoPartido.lugar && ` · ${proximoPartido.lugar}`}
            </p>
            {session && (
              <p className="text-sm pt-2">
                {miConvocatoria === undefined || miConvocatoria === null ? (
                  <span className="text-chalk/40">Convocatoria todavía sin decidir</span>
                ) : miConvocatoria.convocado ? (
                  <span className="text-amarillobrillante">✓ Estás convocado</span>
                ) : (
                  <span className="text-chalk/40">No convocado para este partido</span>
                )}
              </p>
            )}
            <Link href={`/calendario/${proximoPartido.id}`} className="inline-block text-amarillobrillante text-sm hover:underline pt-1">
              Ver detalle →
            </Link>
          </div>
        ) : (
          <p className="text-chalk/50 text-sm">No hay ningún partido programado todavía.</p>
        )}
      </section>

      {partidosSinResponder.length > 0 && (
        <section className="card p-5 space-y-4 border-amarillo/30">
          <h2 className="font-display text-lg">
            Partidos por responder <span className="text-amarillobrillante">({partidosSinResponder.length})</span>
          </h2>
          <div className="space-y-4">
            {partidosSinResponder.map((p) => (
              <div key={p.id} className="space-y-2">
                <Link href={`/calendario/${p.id}`} className="block hover:underline">
                  <span className="text-chalk">
                    {p.esLocal ? "vs " : "@ "}
                    {p.rival}
                  </span>{" "}
                  <span className="text-chalk/50 text-sm">
                    {formatFechaHora(p.fecha)} · {p.competicion}
                    {p.jornada !== null && ` · Jornada ${p.jornada}`}
                  </span>
                </Link>
                <DisponibilidadSelector partidoId={p.id} disponibilidadInicial="SIN_RESPONDER" />
              </div>
            ))}
          </div>
        </section>
      )}

      {ultimoPartido && (
        <section className="card p-5 space-y-1">
          <h2 className="font-display text-lg">Último resultado</h2>
          <p className="text-chalk">
            {ultimoPartido.esLocal ? "Tarados Malibú" : ultimoPartido.rival}{" "}
            <span className="font-display text-amarillobrillante">
              {ultimoPartido.esLocal ? ultimoPartido.golesFavor : ultimoPartido.golesContra} -{" "}
              {ultimoPartido.esLocal ? ultimoPartido.golesContra : ultimoPartido.golesFavor}
            </span>{" "}
            {ultimoPartido.esLocal ? ultimoPartido.rival : "Tarados Malibú"}
          </p>
          <p className="text-chalk/60 text-sm">{formatFechaHora(ultimoPartido.fecha)}</p>
        </section>
      )}

      {tiposPendientes.length > 0 && (
        <section className="card p-5 border-coral/40">
          <p className="text-coral text-sm">
            Tienes pendiente: {tiposPendientes.map((t) => ETIQUETA_TIPO_PAGO[t]).join(", ")}.{" "}
            <Link href="/pagos" className="underline">
              Ver pagos
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
