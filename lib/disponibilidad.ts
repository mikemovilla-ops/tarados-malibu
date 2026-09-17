import type { Disponibilidad } from "@prisma/client";

export const ETIQUETA_DISPONIBILIDAD: Record<Disponibilidad, string> = {
  SIN_RESPONDER: "Sin responder",
  VOY: "Voy",
  NO_VOY: "No voy",
  DUDA: "Duda",
};

export type ConteoDisponibilidad = { VOY: number; DUDA: number; NO_VOY: number; SIN_RESPONDER: number };

// `respuestas` son solo las filas de Convocatoria de jugadores ACTIVOS (los
// de AYUDA no cuentan en este resumen). Un activo sin fila todavía, o con
// fila pero sin disponibilidad respondida, cuenta igual como "sin
// responder": por eso se parte de `totalActivos` en vez de sumar 4 grupos.
export function contarDisponibilidad(
  respuestas: { disponibilidad: Disponibilidad }[],
  totalActivos: number
): ConteoDisponibilidad {
  const conteo: ConteoDisponibilidad = { VOY: 0, DUDA: 0, NO_VOY: 0, SIN_RESPONDER: 0 };
  let respondidos = 0;
  for (const r of respuestas) {
    if (r.disponibilidad === "VOY" || r.disponibilidad === "DUDA" || r.disponibilidad === "NO_VOY") {
      conteo[r.disponibilidad]++;
      respondidos++;
    }
  }
  conteo.SIN_RESPONDER = Math.max(0, totalActivos - respondidos);
  return conteo;
}

// Cuántos jugadores de AYUDA tiene el admin marcados como "Voy" a este
// partido (ver ConvocatoriaEditor) — se suman al recuento de "van" de fuera,
// pero se anotan aparte ("2 van, 1 de ayuda") en vez de mezclarse sin más:
// el equipo quiere saber cuántos de los habituales van a estar.
export function contarAyudaVan(respuestasAyuda: { disponibilidad: Disponibilidad }[]): number {
  return respuestasAyuda.filter((r) => r.disponibilidad === "VOY").length;
}
