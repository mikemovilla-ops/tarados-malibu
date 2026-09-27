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
    };
    fila.partidosJugados += 1;
    fila.goles += c.goles;
    fila.asistencias += c.asistencias;
    if (c.tarjetaAmarilla) fila.tarjetasAmarillas += 1;
    if (c.tarjetaRoja) fila.tarjetasRojas += 1;
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
  goles: number;
  asistencias: number;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
};

export type EstadisticasJugador = {
  partidosJugados: number;
  goles: number;
  asistencias: number;
  tarjetasAmarillas: number;
  tarjetasRojas: number;
  partidos: PartidoJugado[];
};

// Detalle de un jugador para su ficha en /plantilla/[id]: el mismo resumen
// que sale en el ranking, más el partido a partido que lo compone (más
// recientes primero). Mismo filtro que calcularRanking: solo jornadas ya
// cerradas por el admin.
export async function calcularEstadisticasJugador(userId: string): Promise<EstadisticasJugador> {
  const convocatorias = await prisma.convocatoria.findMany({
    where: { userId, convocado: true, partido: { cerrado: true } },
    include: { partido: true },
    orderBy: { partido: { fecha: "desc" } },
  });

  const partidos: PartidoJugado[] = convocatorias.map((c) => ({
    partidoId: c.partido.id,
    fecha: c.partido.fecha,
    rival: c.partido.rival,
    esLocal: c.partido.esLocal,
    competicion: c.partido.competicion,
    jornada: c.partido.jornada,
    golesFavor: c.partido.golesFavor,
    golesContra: c.partido.golesContra,
    goles: c.goles,
    asistencias: c.asistencias,
    tarjetaAmarilla: c.tarjetaAmarilla,
    tarjetaRoja: c.tarjetaRoja,
  }));

  return {
    partidosJugados: partidos.length,
    goles: partidos.reduce((suma, p) => suma + p.goles, 0),
    asistencias: partidos.reduce((suma, p) => suma + p.asistencias, 0),
    tarjetasAmarillas: partidos.filter((p) => p.tarjetaAmarilla).length,
    tarjetasRojas: partidos.filter((p) => p.tarjetaRoja).length,
    partidos,
  };
}
