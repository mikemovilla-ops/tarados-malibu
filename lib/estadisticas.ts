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
export async function calcularRanking(): Promise<FilaEstadistica[]> {
  const convocatorias = await prisma.convocatoria.findMany({
    where: { convocado: true, partido: { cerrado: true } },
    select: {
      userId: true,
      goles: true,
      asistencias: true,
      tarjetaAmarilla: true,
      tarjetaRoja: true,
      user: { select: { name: true, apodo: true, dorsal: true } },
    },
  });

  const porJugador = new Map<string, FilaEstadistica>();
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
    (a, b) => b.goles - a.goles || b.asistencias - a.asistencias || a.nombre.localeCompare(b.nombre)
  );
}
