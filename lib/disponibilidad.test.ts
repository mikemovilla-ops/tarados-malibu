import { describe, expect, it } from "vitest";
import { contarDisponibilidad, contarAyudaPodriaIr, ayudaSinResponder } from "@/lib/disponibilidad";

describe("contarDisponibilidad", () => {
  it("cuenta cada respuesta en su grupo", () => {
    const respuestas = [
      { disponibilidad: "VOY" as const },
      { disponibilidad: "VOY" as const },
      { disponibilidad: "DUDA" as const },
      { disponibilidad: "NO_VOY" as const },
    ];
    expect(contarDisponibilidad(respuestas, 4)).toEqual({ VOY: 2, DUDA: 1, NO_VOY: 1, SIN_RESPONDER: 0 });
  });

  it("trata a los activos sin fila (o con SIN_RESPONDER) como sin responder", () => {
    const respuestas = [{ disponibilidad: "VOY" as const }, { disponibilidad: "SIN_RESPONDER" as const }];
    // totalActivos=5: solo 1 respuesta cuenta como respondida (VOY), el resto
    // (4) son sin responder, aunque una de ellas tuviera fila con SIN_RESPONDER.
    expect(contarDisponibilidad(respuestas, 5)).toEqual({ VOY: 1, DUDA: 0, NO_VOY: 0, SIN_RESPONDER: 4 });
  });

  it("nunca da sin responder negativo si hay más respuestas que activos", () => {
    const respuestas = [{ disponibilidad: "VOY" as const }, { disponibilidad: "NO_VOY" as const }];
    expect(contarDisponibilidad(respuestas, 1).SIN_RESPONDER).toBe(0);
  });
});

describe("contarAyudaPodriaIr", () => {
  it("cuenta solo los que han dicho VOY", () => {
    const respuestas = [
      { disponibilidad: "VOY" as const },
      { disponibilidad: "DUDA" as const },
      { disponibilidad: "VOY" as const },
      { disponibilidad: "NO_VOY" as const },
    ];
    expect(contarAyudaPodriaIr(respuestas)).toBe(2);
  });

  it("da 0 si ninguno de ayuda ha dicho que podría ir", () => {
    expect(contarAyudaPodriaIr([{ disponibilidad: "SIN_RESPONDER" as const }])).toBe(0);
  });
});

describe("ayudaSinResponder", () => {
  it("da los de ayuda sin fila o con fila SIN_RESPONDER", () => {
    const jugadores = [{ id: "a" }, { id: "b" }, { id: "c" }];
    const respuestas = [
      { userId: "a", disponibilidad: "VOY" as const },
      { userId: "b", disponibilidad: "SIN_RESPONDER" as const },
      // "c" no tiene ni fila.
    ];
    expect(ayudaSinResponder(jugadores, respuestas)).toEqual([{ id: "b" }, { id: "c" }]);
  });

  it("da vacío si todos han respondido algo distinto de SIN_RESPONDER", () => {
    const jugadores = [{ id: "a" }];
    const respuestas = [{ userId: "a", disponibilidad: "NO_VOY" as const }];
    expect(ayudaSinResponder(jugadores, respuestas)).toEqual([]);
  });
});
