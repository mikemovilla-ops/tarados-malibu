import { describe, expect, it } from "vitest";
import { nombreMostrado } from "@/lib/jugadores";

describe("nombreMostrado", () => {
  it("usa el apodo si está puesto", () => {
    expect(nombreMostrado({ name: "Miguel Valdunquillo", apodo: "Migue" })).toBe("Migue");
  });

  it("usa el nombre de Google si no hay apodo", () => {
    expect(nombreMostrado({ name: "Miguel Valdunquillo", apodo: null })).toBe("Miguel Valdunquillo");
  });

  it("cae a 'Sin nombre' si no hay ni apodo ni nombre", () => {
    expect(nombreMostrado({ name: null, apodo: null })).toBe("Sin nombre");
  });

  it("ignora un apodo en blanco y usa el nombre", () => {
    expect(nombreMostrado({ name: "Miguel", apodo: "" })).toBe("Miguel");
  });
});
