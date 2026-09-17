import { describe, expect, it } from "vitest";
import { formatFecha, formatFechaHora, formatFechaCorta, toInputDatetimeLocal } from "@/lib/fechas";

describe("formatFecha", () => {
  it("formatea una fecha en español con día de la semana", () => {
    // 2026-09-17 es jueves.
    expect(formatFecha(new Date(2026, 8, 17))).toBe("jueves 17 de septiembre");
  });
});

describe("formatFechaHora", () => {
  it("añade la hora con ceros a la izquierda", () => {
    expect(formatFechaHora(new Date(2026, 8, 17, 9, 5))).toBe("jueves 17 de septiembre, 09:05");
  });

  it("no rellena las horas/minutos de dos dígitos", () => {
    expect(formatFechaHora(new Date(2026, 8, 17, 21, 30))).toBe("jueves 17 de septiembre, 21:30");
  });
});

describe("toInputDatetimeLocal", () => {
  it("da el formato YYYY-MM-DDTHH:mm en hora local", () => {
    expect(toInputDatetimeLocal(new Date(2026, 0, 5, 8, 3))).toBe("2026-01-05T08:03");
  });
});

describe("formatFechaCorta", () => {
  it("da DD/MM/YYYY usando los getters en UTC", () => {
    // Medianoche UTC del 5 de enero — si usara getters locales en una
    // franja horaria negativa se desplazaría al día anterior.
    expect(formatFechaCorta(new Date(Date.UTC(2026, 0, 5)))).toBe("05/01/2026");
  });
});
