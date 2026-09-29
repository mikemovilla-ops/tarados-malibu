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

// Cuántos jugadores de AYUDA han dicho "Podría ir" (o el admin los ha
// marcado como "Voy" desde ConvocatoriaEditor) — a diferencia de un activo,
// esto no es una confirmación, así que no se suma al recuento de "van": se
// muestra aparte, y es el admin quien decide luego si cuenta con ellos al
// convocar.
export function contarAyudaPodriaIr(respuestasAyuda: { disponibilidad: Disponibilidad }[]): number {
  return respuestasAyuda.filter((r) => r.disponibilidad === "VOY").length;
}

// A diferencia del resto de este módulo (que solo cuenta), aquí interesa
// saber quiénes son: los de AYUDA no entran en el resumen de disponibilidad
// de los activos, así que sin esto nadie se entera de que un ayuda se ha
// quedado sin contestar — y como no se les avisa por email de cada
// jornada, es fácil que se les olvide sin que nadie se lo recuerde.
export function ayudaSinResponder<T extends { id: string }>(
  jugadoresAyuda: T[],
  respuestasAyuda: { userId: string; disponibilidad: Disponibilidad }[]
): T[] {
  const respondidos = new Set(
    respuestasAyuda.filter((r) => r.disponibilidad !== "SIN_RESPONDER").map((r) => r.userId)
  );
  return jugadoresAyuda.filter((j) => !respondidos.has(j.id));
}
