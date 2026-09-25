import { describe, expect, it } from "vitest";
import { aplicarVistaPrevia, type PerfilReal } from "@/lib/viewer";

const ADMIN: PerfilReal = { esAdmin: true, rol: "JUGADOR", estado: "ACTIVO" };
const JUGADOR: PerfilReal = { esAdmin: false, rol: "JUGADOR", estado: "ACTIVO" };

describe("aplicarVistaPrevia", () => {
  it("no cambia nada en producción, aunque haya cookie y seas admin", () => {
    expect(aplicarVistaPrevia(ADMIN, "SOCIO_PAGADO", true)).toEqual({ ...ADMIN, alDiaDePago: null });
  });

  it("no cambia nada si no eres admin de verdad, aunque haya cookie", () => {
    expect(aplicarVistaPrevia(JUGADOR, "SOCIO_PAGADO", false)).toEqual({ ...JUGADOR, alDiaDePago: null });
  });

  it("no cambia nada si eres admin pero no hay cookie", () => {
    expect(aplicarVistaPrevia(ADMIN, undefined, false)).toEqual({ ...ADMIN, alDiaDePago: null });
  });

  it("no cambia nada si la cookie trae un valor desconocido", () => {
    expect(aplicarVistaPrevia(ADMIN, "algo-raro", false)).toEqual({ ...ADMIN, alDiaDePago: null });
  });

  it("ACTIVO: se ve como jugador activo, deja de ser admin", () => {
    expect(aplicarVistaPrevia(ADMIN, "ACTIVO", false)).toEqual({
      esAdmin: false,
      rol: "JUGADOR",
      estado: "ACTIVO",
      alDiaDePago: null,
    });
  });

  it("AYUDA: se ve como jugador de ayuda, deja de ser admin", () => {
    expect(aplicarVistaPrevia(ADMIN, "AYUDA", false)).toEqual({
      esAdmin: false,
      rol: "JUGADOR",
      estado: "AYUDA",
      alDiaDePago: null,
    });
  });

  it("SOCIO_PAGADO: se ve como socio al día, forzado a true", () => {
    expect(aplicarVistaPrevia(ADMIN, "SOCIO_PAGADO", false)).toEqual({
      esAdmin: false,
      rol: "SOCIO",
      estado: null,
      alDiaDePago: true,
    });
  });

  it("SOCIO_PENDIENTE: se ve como socio con cuota pendiente, forzado a false", () => {
    expect(aplicarVistaPrevia(ADMIN, "SOCIO_PENDIENTE", false)).toEqual({
      esAdmin: false,
      rol: "SOCIO",
      estado: null,
      alDiaDePago: false,
    });
  });
});
