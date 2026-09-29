import { describe, expect, it } from "vitest";
import { puedeEscribirForo, esNoLeido } from "@/lib/foro";

describe("puedeEscribirForo", () => {
  it("no puede participar si no está logueado, sea cual sea el rol", () => {
    expect(puedeEscribirForo({ logueado: false, rol: "JUGADOR", alDiaDePago: true })).toBe(false);
    expect(puedeEscribirForo({ logueado: false, rol: null, alDiaDePago: true })).toBe(false);
  });

  it("un jugador puede participar aunque no esté al día de pago (esa cuota es aparte)", () => {
    expect(puedeEscribirForo({ logueado: true, rol: "JUGADOR", alDiaDePago: false })).toBe(true);
  });

  it("un socio al día puede participar", () => {
    expect(puedeEscribirForo({ logueado: true, rol: "SOCIO", alDiaDePago: true })).toBe(true);
  });

  it("un socio con cuota pendiente no puede participar", () => {
    expect(puedeEscribirForo({ logueado: true, rol: "SOCIO", alDiaDePago: false })).toBe(false);
  });

  it("un no jugador no puede participar aunque alDiaDePago diera true (todavía no es socio)", () => {
    expect(puedeEscribirForo({ logueado: true, rol: "NO_JUGADOR", alDiaDePago: true })).toBe(false);
    expect(puedeEscribirForo({ logueado: true, rol: "NO_JUGADOR", alDiaDePago: false })).toBe(false);
  });
});

describe("esNoLeido", () => {
  it("es no leído si nunca se ha leído (leidoEn null)", () => {
    expect(esNoLeido(new Date(2026, 0, 1), null)).toBe(true);
  });

  it("es no leído si hay actividad después de la última lectura", () => {
    expect(esNoLeido(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBe(true);
  });

  it("está leído si la última lectura es posterior (o igual) a la actividad", () => {
    expect(esNoLeido(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
    expect(esNoLeido(new Date(2026, 0, 1), new Date(2026, 0, 1))).toBe(false);
  });
});
