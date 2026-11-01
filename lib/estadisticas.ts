import { prisma } from "@/lib/prisma";
import { nombreMostrado } from "@/lib/jugadores";

export type FilaEstadistica = {
  userId: string;
  nombre: string;
  dorsal: number | null;
  partidosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  golesEncajados: number;
};

// Ranking de la plantilla: partidos jugados (convocado=true, aunque no
// marcara goles), goles y asistencias, sumando todas las filas de
// Convocatoria de cada jugador. Se calcula al vuelo en vez de guardar
// contadores aparte: con el volumen de partidos de un equipo de fútbol 7
// (unas 25-30 jornadas de liga al año) la consulta es trivial, y así no hay
// que mantener sincronizados dos sitios distintos con el mismo dato.
//
// Solo se cuentan partidos con `cerrado = true`: mientras el admin todavía
// está metiendo goles/asistencias/tarjetas, esos números no deben verse en
// el ranking a medio rellenar.
//
// Todos los jugadores activos salen en el ranking aunque lleven 0 partidos
// (p.ej. si todavía no se ha cerrado ninguna jornada) — no solo quien ya
// tiene alguna fila de Convocatoria.
export async function calcularRanking(): Promise<FilaEstadistica[]> {
  const [activos, convocatorias] = await Promise.all([
    prisma.user.findMany({
      where: { estado: "ACTIVO", rol: "JUGADOR" },
      select: { id: true, name: true, apodo: true, dorsal: true },
    }),
    prisma.convocatoria.findMany({
      where: { convocado: true, partido: { cerrado: true } },
      select: {
        userId: true,
        goles: true,
        asistencias: true,
        tarjetaAmarilla: true,
        tarjetaRoja: true,
        golesEncajados: true,
        user: { select: { name: true, apodo: true, dorsal: true } },
      },
    }),
  ]);

  const porJugador = new Map<string, FilaEstadistica>();
  for (const a of activos) {
    porJugador.set(a.id, {
      userId: a.id,
      nombre: nombreMostrado(a),
      dorsal: a.dorsal,
      partidosJugados: 0,
      goles: 0,
      asistencias: 0,
      tarjetasAmarillas: 0,
      tarjetasRojas: 0,
      golesEncajados: 0,
    });
  }
  for (const c of convocatorias) {
    const fila = porJugador.get(c.userId) ?? {
      userId: c.userId,
      nombre: nombreMostrado(c.user),
      dorsal: c.user.dorsal,
      partidosJugados: 0,
      goles: 0,
      asistencias: 0,
      tarjetasAmarillas: 0,
      tarjetasRojas: 0,
      golesEncajados: 0,
    };
    fila.partidosJugados += 1;
    fila.goles += c.goles;
    fila.asistencias += c.asistencias;
    if (c.tarjetaAmarilla) fila.tarjetasAmarillas += 1;
    if (c.tarjetaRoja) fila.tarjetasRojas += 1;
    fila.golesEncajados += c.golesEncajados;
    porJugador.set(c.userId, fila);
  }

  return [...porJugador.values()].sort(
    (a, b) =>
      b.partidosJugados - a.partidosJugados ||
      b.goles - a.goles ||
      b.asistencias - a.asistencias ||
      a.nombre.localeCompare(b.nombre)
  );
}

export type PartidoJugado = {
  partidoId: string;
  fecha: Date;
  rival: string;
  esLocal: boolean;
  competicion: string;
  jornada: number | null;
  golesFavor: number | null;
  golesContra: number | null;
  // false si la jornada ya está cerrada pero el jugador no estaba convocado
  // (o no tenía ni fila de Convocatoria) — el resto de campos van a 0/false
  // en ese caso, no hay nada suyo que contar en ese partido.
  jugado: boolean;
  goles: number;
  asistencias: number;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
  golesEncajados: number;
};

export type EstadisticasJugador = {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  golesEncajados: number;
  partidos: PartidoJugado[];
};

// Detalle de un jugador para su ficha en /plantilla/[id]: el mismo resumen
// que sale en el ranking, más el partido a partido que lo compone (más
// recientes primero). A diferencia de calcularRanking, aquí se listan TODAS
// las jornadas ya cerradas (no solo en las que jugó) y se marca cada una con
// `jugado` — así se ve también en qué partidos no fue convocado, en vez de
// que esas jornadas desaparezcan sin más de su ficha.
export async function calcularEstadisticasJugador(userId: string): Promise<EstadisticasJugador> {
  const [partidosCerrados, convocatorias] = await Promise.all([
    prisma.partido.findMany({ where: { cerrado: true }, orderBy: { fecha: "desc" } }),
    prisma.convocatoria.findMany({ where: { userId, partido: { cerrado: true } } }),
  ]);
  const convocatoriaPorPartido = new Map(convocatorias.map((c) => [c.partidoId, c]));

  const partidos: PartidoJugado[] = partidosCerrados.map((p) => {
    const c = convocatoriaPorPartido.get(p.id);
    const jugado = c?.convocado ?? false;
    return {
      partidoId: p.id,
      fecha: p.fecha,
      rival: p.rival,
      esLocal: p.esLocal,
      competicion: p.competicion,
      jornada: p.jornada,
      golesFavor: p.golesFavor,
      golesContra: p.golesContra,
      jugado,
      goles: jugado ? c!.goles : 0,
      asistencias: jugado ? c!.asistencias : 0,
      tarjetaAmarilla: jugado ? c!.tarjetaAmarilla : false,
      tarjetaRoja: jugado ? c!.tarjetaRoja : false,
      golesEncajados: jugado ? c!.golesEncajados : 0,
    };
  });

  const jugados = partidos.filter((p) => p.jugado);

  return {
    partidosJugados: jugados.length,
    goles: jugados.reduce((suma, p) => suma + p.goles, 0),
    asistencias: jugados.reduce((suma, p) => suma + p.asistencias, 0),
    tarjetasAmarillas: jugados.filter((p) => p.tarjetaAmarilla).length,
    tarjetasRojas: jugados.filter((p) => p.tarjetaRoja).length,
    golesEncajados: jugados.reduce((suma, p) => suma + p.golesEncajados, 0),
    partidos,
  };
}
