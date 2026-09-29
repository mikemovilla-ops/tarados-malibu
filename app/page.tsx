import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatFechaHora, formatHora, horaConvocatoria } from "@/lib/fechas";
import { getSecciones } from "@/lib/pagos";
import { getViewer } from "@/lib/viewer";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";
import SeccionEditable from "@/components/SeccionEditable";
import AnuncioAdmin from "@/components/AnuncioAdmin";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await getViewer();
  const { session, userId, esAdmin } = viewer;
  // Socio y "no jugador" (respondió que no juega, aún sin cuota pagada) se
  // tratan igual aquí: ninguno de los dos juega ni tiene cuota de jugador.
  const noJuega = viewer.rol === "SOCIO" || viewer.rol === "NO_JUGADOR";

  const anuncio = await prisma.anuncio.findUnique({ where: { id: "actual" } });

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
  const miDisponibilidadProximo = miConvocatoria?.disponibilidad ?? "SIN_RESPONDER";

  // Partidos futuros a los que este jugador todavía no ha respondido
  // (voy/no voy/duda) — sin fila de convocatoria, o con fila pero
  // disponibilidad todavía "sin responder". Quien no juega no responde
  // disponibilidad, así que no le sale nada aquí; tampoco a quien no ha
  // contestado aún si es jugador (el servidor también lo rechaza, ver
  // /api/partidos/[id]/disponibilidad).
  const partidosSinResponder =
    userId && !noJuega && !viewer.necesitaElegirRol
      ? await prisma.partido.findMany({
          where: {
            fecha: { gte: new Date() },
            cerrado: false,
            convocatorias: { none: { userId, disponibilidad: { not: "SIN_RESPONDER" } } },
          },
          orderBy: { fecha: "asc" },
        })
      : [];
  // El próximo partido ya se responde desde su propia sección (más arriba),
  // así que aquí solo van los demás.
  const otrosPartidosSinResponder = partidosSinResponder.filter((p) => p.id !== proximoPartido?.id);

  // Un jugador activo tiene cuota de jugador; quien no juega tiene la suya
  // propia (secciones con destinatario distinto, ver lib/pagos.ts).
  const tienePagosPendientesPosibles = viewer.rol === "JUGADOR" ? viewer.estado === "ACTIVO" : noJuega;
  const misPagos = userId && tienePagosPendientesPosibles ? await prisma.pago.findMany({ where: { userId } }) : [];
  const secciones = tienePagosPendientesPosibles ? await getSecciones(noJuega ? "SOCIO" : "JUGADOR") : [];
  const seccionesPendientes = secciones.filter((s) => !misPagos.find((p) => p.seccionId === s.id)?.pagado);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <Image src="/escudo.png" alt="Escudo Tarados Malibú" width={96} height={96} className="mx-auto" priority />
        <h1 className="font-display text-3xl">Tarados Malibú</h1>
        <p className="text-chalk/60 text-sm">Fútbol 7</p>
      </div>

      {esAdmin ? (
        <SeccionEditable
          resumen={
            anuncio?.activo && anuncio.texto ? (
              <div className="card p-4 border-amarillo/40 bg-amarillo/5">
                <p className="text-chalk whitespace-pre-wrap">{anuncio.texto}</p>
              </div>
            ) : (
              <p className="text-chalk/40 text-sm">Sin anuncio activo en la home.</p>
            )
          }
        >
          <AnuncioAdmin textoInicial={anuncio?.texto ?? ""} activoInicial={anuncio?.activo ?? false} />
        </SeccionEditable>
      ) : (
        anuncio?.activo &&
        anuncio.texto && (
          <div className="card p-4 border-amarillo/40 bg-amarillo/5">
            <p className="text-chalk whitespace-pre-wrap">{anuncio.texto}</p>
          </div>
        )
      )}

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
            <p className="text-chalk/40 text-xs">
              Convocatoria: {formatHora(horaConvocatoria(proximoPartido.fecha))}
            </p>
            {session && !noJuega && !viewer.necesitaElegirRol && (
              <div className="pt-2 space-y-2">
                <DisponibilidadSelector
                  partidoId={proximoPartido.id}
                  disponibilidadInicial={miDisponibilidadProximo}
                  esAyuda={viewer.estado === "AYUDA"}
                />
                {miConvocatoria?.convocado && <p className="text-sm text-amarillobrillante">✓ Estás convocado</p>}
              </div>
            )}
            {session && !noJuega && viewer.necesitaElegirRol && (
              <p className="text-chalk/50 text-sm pt-2">
                Antes contesta en{" "}
                <Link href="/ajustes" className="underline">
                  Ajustes
                </Link>{" "}
                si eres jugador.
              </p>
            )}
            {session && (
              <Link href={`/calendario/${proximoPartido.id}`} className="inline-block text-amarillobrillante text-sm hover:underline pt-1">
                Ver detalle →
              </Link>
            )}
          </div>
        ) : (
          <p className="text-chalk/50 text-sm">No hay ningún partido programado todavía.</p>
        )}
      </section>

      {/* El próximo partido ya tiene su propio selector de disponibilidad
          arriba — aquí solo van los demás partidos abiertos pendientes de
          respuesta, para no repetir el mismo partido dos veces. */}
      {otrosPartidosSinResponder.length > 0 && (
        <section className="card p-5 space-y-4 border-amarillo/30">
          <h2 className="font-display text-lg">
            Partidos por responder <span className="text-amarillobrillante">({otrosPartidosSinResponder.length})</span>
          </h2>
          <div className="space-y-4">
            {otrosPartidosSinResponder.map((p) => (
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
                <DisponibilidadSelector partidoId={p.id} disponibilidadInicial="SIN_RESPONDER" esAyuda={viewer.estado === "AYUDA"} />
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
          {(session || ultimoPartido.cerrado) && (
            <Link href={`/calendario/${ultimoPartido.id}`} className="inline-block text-amarillobrillante text-sm hover:underline pt-1">
              Ver detalle →
            </Link>
          )}
        </section>
      )}

      {seccionesPendientes.length > 0 && (
        <section className="card p-5 border-coral/40">
          <p className="text-coral text-sm">
            Tienes pendiente: {seccionesPendientes.map((s) => s.nombre).join(", ")}.{" "}
            <Link href="/pagos" className="underline">
              Ver pagos
            </Link>
          </p>
        </section>
      )}
    </div>
  );
}
