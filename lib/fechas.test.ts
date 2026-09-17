import { describe, expect, it } from "vitest";
import { formatFecha } from "@/lib/fechas";

describe("formatFecha", () => {
  it("formatea una fecha en español con día de la semana", () => {
    // 2026-09-17 es jueves.
    expect(formatFecha(new Date(2026, 8, 17))).toBe("jueves 17 de septiembre");
  });
});
