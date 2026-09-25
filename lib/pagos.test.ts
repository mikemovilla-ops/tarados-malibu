import { describe, expect, it } from "vitest";
import { todasSeccionesPagadas } from "@/lib/pagos";

describe("todasSeccionesPagadas", () => {
  it("da true si no hay ninguna sección", () => {
    expect(todasSeccionesPagadas([], [])).toBe(true);
  });

  it("da true si todas las secciones tienen un pago marcado como pagado", () => {
    const secciones = [{ id: "a" }, { id: "b" }];
    const pagos = [
      { seccionId: "a", pagado: true },
      { seccionId: "b", pagado: true },
    ];
    expect(todasSeccionesPagadas(secciones, pagos)).toBe(true);
  });

  it("da false si una sección no tiene ningún pago", () => {
    const secciones = [{ id: "a" }, { id: "b" }];
    const pagos = [{ seccionId: "a", pagado: true }];
    expect(todasSeccionesPagadas(secciones, pagos)).toBe(false);
  });

  it("da false si una sección tiene pago pero sin marcar como pagado", () => {
    const secciones = [{ id: "a" }];
    const pagos = [{ seccionId: "a", pagado: false }];
    expect(todasSeccionesPagadas(secciones, pagos)).toBe(false);
  });

  it("ignora pagos de otras secciones que no vienen en la lista", () => {
    const secciones = [{ id: "a" }];
    const pagos = [
      { seccionId: "a", pagado: true },
      { seccionId: "otra-que-no-cuenta", pagado: false },
    ];
    expect(todasSeccionesPagadas(secciones, pagos)).toBe(true);
  });
});
