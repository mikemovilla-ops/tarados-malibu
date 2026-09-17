import { describe, expect, it } from "vitest";
import { formatMes, mesActual } from "@/lib/fechas";

describe("formatMes", () => {
  it("formatea YYYY-MM a texto en español", () => {
    expect(formatMes("2026-09")).toBe("septiembre 2026");
    expect(formatMes("2027-01")).toBe("enero 2027");
  });
});

describe("mesActual", () => {
  it("devuelve el mes en formato YYYY-MM", () => {
    expect(mesActual()).toMatch(/^\d{4}-\d{2}$/);
  });
});
