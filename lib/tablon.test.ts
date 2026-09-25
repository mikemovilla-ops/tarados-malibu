import { describe, expect, it } from "vitest";
import { puedeEscribirTablon } from "@/lib/tablon";

describe("puedeEscribirTablon", () => {
  it("no puede escribir si no está logueado, sea cual sea el rol", () => {
    expect(puedeEscribirTablon({ logueado: false, rol: "JUGADOR", alDiaDePago: true })).toBe(false);
    expect(puedeEscribirTablon({ logueado: false, rol: null, alDiaDePago: true })).toBe(false);
  });

  it("un jugador puede escribir aunque no esté al día de pago (esa cuota es aparte)", () => {
    expect(puedeEscribirTablon({ logueado: true, rol: "JUGADOR", alDiaDePago: false })).toBe(true);
  });

  it("un socio al día puede escribir", () => {
    expect(puedeEscribirTablon({ logueado: true, rol: "SOCIO", alDiaDePago: true })).toBe(true);
  });

  it("un socio con cuota pendiente no puede escribir", () => {
    expect(puedeEscribirTablon({ logueado: true, rol: "SOCIO", alDiaDePago: false })).toBe(false);
  });
});
