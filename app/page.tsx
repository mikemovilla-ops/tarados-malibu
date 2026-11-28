import Link from "next/link";
import Image from "next/image";
import EnlaceConCarga from "@/components/EnlaceConCarga";
import { prisma } from "@/lib/prisma";
import { formatFechaHora, formatHora, horaConvocatoria } from "@/lib/fechas";
import { getSecciones } from "@/lib/pagos";
import { getViewer, puedeVerDetalles } from "@/lib/viewer";
import { obtenerPrevisionPartido, iconoTiempo } from "@/lib/tiempo";
import { ayudaSinResponder } from "@/lib/disponibilidad";
import { nombreMostrado } from "@/lib/jugadores";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import DisponibilidadSelector from "@/components/DisponibilidadSelector";
import DeclararAsistencia from "@/components/DeclararAsistencia";
import SeccionEditable from "@/components/SeccionEditable";
import AnuncioAdmin from "@/components/AnuncioAdmin";
import QuienVaDesplegable from "@/components/QuienVaDesplegable";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const viewer = await getViewer();
  const { session, userId, esAdmin } = viewer;
  // Socio y "no jugador" (respondió que no juega, aún sin cuota pagada) se
  // tratan igual aquí: ninguno de los dos juega ni tiene cuota de jugador.
  const noJuega = viewer.rol === "SOCIO" || viewer.rol === "NO_JUGADOR";
  const puedeVerDetalle = puedeVerDetalles(viewer.rol);

  // Ninguna de estas cuatro depende de las otras — en paralelo en vez de
  // una detrás de otra, para no sumar cuatro idas y vueltas a la base de
  // datos en la página que más se visita.
  const [anuncio, proximoPartido, ultimoPartido, partidosSinResponder] = await Promise.all([
    prisma.anuncio.findUnique({ where: { id: "actual" } }),
    // Igual que en /calendario: "próximo" se decide por si está cerrado o
    // no, no por la fecha — así uno ya jugado pero pendiente de cerrar se
    // sigue mostrando aquí en vez de desaparecer sin más.
    prisma.partido.findFirst({
      where: { cerrado: false },
      orderBy: { fecha: "asc" },
      include: { convocatorias: true },
    }),
    prisma.partido.findFirst({
      where: { fecha: { lt: new Date() }, golesFavor: { not: null } },
      orderBy: { fecha: "desc" },
    }),
    // Partidos futuros a los que este jugador todavía no ha respondido
    // (voy/no voy/duda) — sin fila de convocatoria, o con fila pero
    // disponibilidad todavía "sin responder". Quien no juega no responde
    // disponibilidad, así que no le sale nada aquí; tampoco a quien no ha
    // contestado aún si es jugador (el servidor también lo rechaza, ver
    // /api/partidos/[id]/disponibilidad).
    userId && !noJuega && !viewer.necesitaElegirRol
      ? prisma.partido.findMany({
          where: {
            fecha: { gte: new Date() },
            cerrado: false,
            convocatorias: { none: { userId, disponibilidad: { not: "SIN_RESPONDER" } } },
          },
          orderBy: { fecha: "asc" },
        })
      : Promise.resolve([]),
  ]);

  // Para el desplegable "Ver detalles" del próximo partido — mismo
  // desglose que en el detalle del partido (ver
  // app/calendario/[id]/page.tsx), solo para quien juega (socios y "no
  // jugador" no responden disponibilidad). Si además eres admin, aquí
  // dentro también va el botón de WhatsApp.
  const verQuienVaProximo = !!session && !noJuega && puedeVerDetalle && !!proximoPartido;

  // Ninguna de estas tres depende de las otras — la previsión es una
  // llamada a una API externa, así que conviene que no bloquee ni la vaya
  // a bloquear ninguna consulta a la base de datos.
  const [prevision, jugadoresProximo, pizzaProximo] = await Promise.all([
    proximoPartido ? obtenerPrevisionPartido(proximoPartido.fecha) : Promise.resolve(null),
    verQuienVaProximo
      ? prisma.user.findMany({
          where: { rol: "JUGADOR" },
          select: { id: true, name: true, apodo: true, estado: true },
        })
      : Promise.resolve([]),
    verQuienVaProximo && proximoPartido
      ? prisma.asistenciaPizza.findMany({
          where: { partidoId: proximoPartido.id, voy: true },
          include: { user: { select: { name: true, apodo: true } } },
        })
      : Promise.resolve([]),
  ]);

  const gruposQuienVa: { etiqueta: string; nombres: string[]; color?: string }[] = [];
  let whatsappProximo:
    | { partidoId: string; rival: string; esLocal: boolean; fechaTexto: string; pendientes: string[] }
    | undefined;
  if (verQuienVaProximo && proximoPartido) {
    const dispoPorUsuario = new Map(proximoPartido.convocatorias.map((c) => [c.userId, c.disponibilidad]));
    const activos = jugadoresProximo.filter((j) => j.estado === "ACTIVO");
    const ayuda = jugadoresProximo.filter((j) => j.estado === "AYUDA");
    const porEstado = (estado: "VOY" | "DUDA" | "NO_VOY" | "SIN_RESPONDER") =>
      activos.filter((j) => (dispoPorUsuario.get(j.id) ?? "SIN_RESPONDER") === estado).map(nombreMostrado);
    const ayudaSinContestarProximo = ayudaSinResponder(
      ayuda,
      proximoPartido.convocatorias.map((c) => ({ userId: c.userId, disponibilidad: c.disponibilidad }))
    );
    const sinResponderProximo = [...porEstado("SIN_RESPONDER"), ...ayudaSinContestarProximo.map(nombreMostrado)];
    gruposQuienVa.push(
      { etiqueta: "Van", nombres: porEstado("VOY"), color: "text-amarillobrillante" },
      { etiqueta: "Dudan", nombres: porEstado("DUDA") },
      { etiqueta: "No van", nombres: porEstado("NO_VOY"), color: "text-coral/80" },
      { etiqueta: "Sin responder", nombres: sinResponderProximo },
      {
        etiqueta: "Pizzería",
        nombres: pizzaProximo.map(
          (p) => nombreMostrado(p.user) + (p.acompanantes > 0 ? ` (+${p.acompanantes})` : "")
        ),
      }
    );
    if (esAdmin) {
      whatsappProximo = {
        partidoId: proximoPartido.id,
        rival: proximoPartido.rival,
        esLocal: proximoPartido.esLocal,
        fechaTexto: formatFechaHora(proximoPartido.fecha),
        pendientes: sinResponderProximo,
      };
    }
  }

  const miConvocatoria =
    userId && proximoPartido
      ? proximoPartido.convocatorias.find((c) => c.userId === userId)
      : null;
  const miDisponibilidadProximo = miConvocatoria?.disponibilidad ?? "SIN_RESPONDER";

  // El próximo partido ya se responde desde su propia sección (más arriba),
  // así que aquí solo van los demás.
  const otrosPartidosSinResponder = partidosSinResponder.filter((p) => p.id !== proximoPartido?.id);

  // Mi pizza (ver AsistenciaPizza) para el próximo partido y los demás
  // pendientes de responder, para no perderla al recargar la página.
  const idsPartidosConSelector = [proximoPartido?.id, ...otrosPartidosSinResponder.map((p) => p.id)].filter(
    (id): id is string => !!id
  );
  // Un jugador activo tiene cuota de jugador; quien no juega tiene la suya
  // propia (secciones con destinatario distinto, ver lib/pagos.ts).
  const tienePagosPendientesPosibles = viewer.rol === "JUGADOR" ? viewer.estado === "ACTIVO" : noJuega;

  // Ninguna de estas cuatro depende de las otras.
  const [misPizzas, miAsistenciaSocio, misPagos, secciones] = await Promise.all([
    userId
      ? prisma.asistenciaPizza.findMany({ where: { userId, partidoId: { in: idsPartidosConSelector } } })
      : Promise.resolve([]),
    // Un socio se autodeclara "voy a ver este partido" también desde aquí,
    // no solo desde el detalle (ver DeclararAsistencia).
    viewer.rol === "SOCIO" && userId && proximoPartido
      ? prisma.asistenciaSocio.findUnique({ where: { partidoId_userId: { partidoId: proximoPartido.id, userId } } })
      : Promise.resolve(null),
    userId && tienePagosPendientesPosibles ? prisma.pago.findMany({ where: { userId } }) : Promise.resolve([]),
    tienePagosPendientesPosibles ? getSecciones(noJuega ? "SOCIO" : "JUGADOR") : Promise.resolve([]),
  ]);
  const miPizza = (partidoId: string) => misPizzas.find((p) => p.partidoId === partidoId) ?? null;
  const seccionesPendientes = secciones.filter((s) => !misPagos.find((p) => p.seccionId === s.id)?.pagado);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="text-center space-y-1">
        <Image src="/escudo.png" alt="Escudo Tarados Malibú" width={96} height={96} className="mx-auto" priority />
        <h1 className="font-display text-3xl">Tarados Malibú</h1>
        <p className="text-chalk/60 text-sm">Fútbol 7</p>
        <a
          href="https://ligafutbolmadrid.es/madrid-rio-sabados-202627/resumen"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-1 bg-amarillo/10 border border-amarillo/40 text-amarillobrillante text-sm font-medium px-4 py-1.5 rounded-full hover:bg-amarillo/20 transition"
        >
          Enlace clasificación
        </a>
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
            {(() => {
              const info = (
                <div className="space-y-1">
                  <p className="text-chalk flex items-center justify-between gap-2">
                    <span>
                      {proximoPartido.esLocal ? "Tarados Malibú" : proximoPartido.rival}
                      <span className="text-chalk/40 text-xs mx-1.5 align-middle">vs</span>
                      {proximoPartido.esLocal ? proximoPartido.rival : "Tarados Malibú"}
                    </span>
                    {session && puedeVerDetalle && (
                      <span className="text-amarillobrillante text-lg font-bold">›</span>
                    )}
                  </p>
                  <p className="text-chalk/60 text-sm">{formatFechaHora(proximoPartido.fecha)}</p>
                  <p className="text-chalk/60 text-sm">
                    {proximoPartido.competicion}
                    {proximoPartido.jornada !== null && ` · Jornada ${proximoPartido.jornada}`}
                    {proximoPartido.lugar && ` · ${proximoPartido.lugar}`}
                  </p>
                  <p className="text-chalk/40 text-xs underline">
                    Convocatoria: {formatHora(horaConvocatoria(proximoPartido.fecha))}
                  </p>
                  {prevision && (
                    <p className="text-chalk/60 text-sm">
                      {iconoTiempo(prevision.codigo)} {prevision.temperatura}°C
                      {prevision.probabilidadLluvia > 0 && ` · 💧 ${prevision.probabilidadLluvia}%`}
                    </p>
                  )}
                </div>
              );
              // Toda esta cabecera lleva al detalle del partido — antes solo
              // el enlace suelto "Ver detalle" al final era tocable, y no se
              // notaba que el resto también lo era.
              return session && puedeVerDetalle ? (
                <EnlaceConCarga
                  href={`/calendario/${proximoPartido.id}`}
                  className="block -m-1 p-1 rounded-lg active:bg-chalk/5 transition"
                >
                  {info}
                </EnlaceConCarga>
              ) : (
                info
              );
            })()}
            {session && !noJuega && !viewer.necesitaElegirRol && (
              <div className="pt-2 space-y-2">
                <DisponibilidadSelector
                  partidoId={proximoPartido.id}
                  disponibilidadInicial={miDisponibilidadProximo}
                  esAyuda={viewer.estado === "AYUDA"}
                  pizzaInicial={miPizza(proximoPartido.id)}
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
            {session && viewer.rol === "SOCIO" && !proximoPartido.cerrado && (
              <div className="pt-2">
                <DeclararAsistencia
                  partidoId={proximoPartido.id}
                  declaradoInicial={miAsistenciaSocio?.declarado ?? false}
                  pizzaInicial={miPizza(proximoPartido.id)}
                />
              </div>
            )}
            {verQuienVaProximo && <QuienVaDesplegable grupos={gruposQuienVa} whatsapp={whatsappProximo} />}
          </div>
        ) : (
          <p className="text-chalk/50 text-sm">No hay ningún partido programado todavía.</p>
        )}
      </section>

      {/* El próximo partido ya tiene su propio selector de disponibilidad
          arriba — aquí solo se avisa de los demás partidos pendientes, sin
          selector propio: respondiendo desde aquí mismo, al refrescar la
          página el partido ya respondido desaparecía de esta lista y se
          llevaba por delante la opción de pizzería recién aparecida, antes
          de poder tocarla. Mejor mandar a Calendario, donde la lista no se
          filtra por si has respondido y no tiene ese problema. */}
      {otrosPartidosSinResponder.length > 0 && (
        <section className="card p-5 space-y-3 border-amarillo/30">
          <h2 className="font-display text-lg">
            Partidos por responder <span className="text-amarillobrillante">({otrosPartidosSinResponder.length})</span>
          </h2>
          <div className="space-y-1">
            {otrosPartidosSinResponder.map((p) => (
              <p key={p.id} className="text-chalk/70 text-sm">
                {p.esLocal ? "vs " : "@ "}
                {p.rival} <span className="text-chalk/50">· {formatFechaHora(p.fecha)}</span>
              </p>
            ))}
          </div>
          <EnlaceConCarga href="/calendario" className="inline-block text-amarillobrillante text-sm hover:underline">
            Ir a Calendario →
          </EnlaceConCarga>
        </section>
      )}

      {ultimoPartido && (
        <section className="card p-5 space-y-1">
          <h2 className="font-display text-lg">Último resultado</h2>
          {(() => {
            const info = (
              <div className="space-y-1">
                <p className="text-chalk flex items-center justify-between gap-2">
                  <span>
                    {ultimoPartido.esLocal ? "Tarados Malibú" : ultimoPartido.rival}{" "}
                    <span className="font-display text-amarillobrillante">
                      {ultimoPartido.esLocal ? ultimoPartido.golesFavor : ultimoPartido.golesContra} -{" "}
                      {ultimoPartido.esLocal ? ultimoPartido.golesContra : ultimoPartido.golesFavor}
                    </span>{" "}
                    {ultimoPartido.esLocal ? ultimoPartido.rival : "Tarados Malibú"}
                  </span>
                  {(session || ultimoPartido.cerrado) && puedeVerDetalle && (
                    <span className="text-amarillobrillante text-lg font-bold">›</span>
                  )}
                </p>
                <p className="text-chalk/60 text-sm">{formatFechaHora(ultimoPartido.fecha)}</p>
              </div>
            );
            return (session || ultimoPartido.cerrado) && puedeVerDetalle ? (
              <EnlaceConCarga
                href={`/calendario/${ultimoPartido.id}`}
                className="block -m-1 p-1 rounded-lg active:bg-chalk/5 transition"
              >
                {info}
              </EnlaceConCarga>
            ) : (
              info
            );
          })()}
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
