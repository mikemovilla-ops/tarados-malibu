import { describe, expect, it } from "vitest";
import {
  formatFecha,
  formatFechaHora,
  formatFechaCorta,
  toInputDatetimeLocal,
  parseInputDatetimeLocalMadrid,
  fechaHoraMadrid,
  diaSemanaMadrid,
  inicioSemanaMadrid,
} from "@/lib/fechas";

describe("formatFecha", () => {
  it("formatea una fecha en español con día de la semana, en hora de Madrid", () => {
    // 2026-09-17 08:00 UTC son las 10:00 en Madrid en septiembre (CEST, UTC+2).
    expect(formatFecha(new Date(Date.UTC(2026, 8, 17, 8, 0)))).toBe("jueves 17 de septiembre");
  });

  it("cruza de día si la hora UTC ya cae en el día siguiente en Madrid", () => {
    // 23:30 UTC del 16 de septiembre son las 01:30 del 17 en Madrid.
    expect(formatFecha(new Date(Date.UTC(2026, 8, 16, 23, 30)))).toBe("jueves 17 de septiembre");
  });
});

describe("formatFechaHora", () => {
  it("muestra la hora de Madrid en verano (CEST, UTC+2), no la de UTC", () => {
    expect(formatFechaHora(new Date(Date.UTC(2026, 8, 17, 18, 0)))).toBe("jueves 17 de septiembre, 20:00");
  });

  it("muestra la hora de Madrid en invierno (CET, UTC+1)", () => {
    expect(formatFechaHora(new Date(Date.UTC(2026, 0, 15, 18, 0)))).toBe("jueves 15 de enero, 19:00");
  });
});

describe("toInputDatetimeLocal", () => {
  it("da el formato YYYY-MM-DDTHH:mm en hora de Madrid", () => {
    // 07:03 UTC en enero son las 08:03 en Madrid (CET, UTC+1).
    expect(toInputDatetimeLocal(new Date(Date.UTC(2026, 0, 5, 7, 3)))).toBe("2026-01-05T08:03");
  });
});

describe("parseInputDatetimeLocalMadrid", () => {
  it("interpreta el string como hora de pared en Madrid, en verano (CEST, UTC+2)", () => {
    // Las 20:00 de Madrid el 17 de septiembre son las 18:00 UTC.
    expect(parseInputDatetimeLocalMadrid("2026-09-17T20:00").toISOString()).toBe("2026-09-17T18:00:00.000Z");
  });

  it("interpreta el string como hora de pared en Madrid, en invierno (CET, UTC+1)", () => {
    // Las 19:00 de Madrid el 15 de enero son las 18:00 UTC.
    expect(parseInputDatetimeLocalMadrid("2026-01-15T19:00").toISOString()).toBe("2026-01-15T18:00:00.000Z");
  });

  it("es el inverso de toInputDatetimeLocal (round-trip)", () => {
    const original = new Date(Date.UTC(2026, 8, 17, 18, 0));
    const comoInput = toInputDatetimeLocal(original);
    expect(parseInputDatetimeLocalMadrid(comoInput).getTime()).toBe(original.getTime());
  });
});

describe("fechaHoraMadrid", () => {
  it("da la fecha, hora y minuto de Madrid por separado, en verano (CEST, UTC+2)", () => {
    expect(fechaHoraMadrid(new Date(Date.UTC(2026, 8, 17, 18, 5)))).toEqual({ fecha: "2026-09-17", hora: 20, minuto: 5 });
  });

  it("cruza de día si la hora UTC ya cae en el día siguiente en Madrid", () => {
    expect(fechaHoraMadrid(new Date(Date.UTC(2026, 8, 16, 23, 30)))).toEqual({ fecha: "2026-09-17", hora: 1, minuto: 30 });
  });
});

describe("diaSemanaMadrid", () => {
  it("da el día de la semana de Madrid, no el de UTC, cerca de medianoche", () => {
    // 23:30 UTC del lunes 16 de noviembre de 2026 ya son las 00:30 del
    // martes 17 en Madrid.
    expect(diaSemanaMadrid(new Date(Date.UTC(2026, 10, 16, 23, 30)))).toBe(2);
  });

  it("da domingo = 0 y martes = 2", () => {
    expect(diaSemanaMadrid(new Date(Date.UTC(2026, 10, 15, 10, 0)))).toBe(0);
    expect(diaSemanaMadrid(new Date(Date.UTC(2026, 10, 17, 10, 0)))).toBe(2);
  });
});

describe("inicioSemanaMadrid", () => {
  it("da el lunes de esa semana (martes 17 de noviembre de 2026 -> lunes 16)", () => {
    expect(inicioSemanaMadrid(new Date(Date.UTC(2026, 10, 17, 10, 0)))).toBe("2026-11-16");
  });

  it("un sábado da el lunes de su misma semana, no el siguiente", () => {
    // Sábado 28 de noviembre de 2026 -> lunes 23.
    expect(inicioSemanaMadrid(new Date(Date.UTC(2026, 10, 28, 17, 0)))).toBe("2026-11-23");
  });

  it("un domingo cuenta en la semana que termina, no en la que empieza", () => {
    // Domingo 15 de noviembre de 2026 -> lunes 9.
    expect(inicioSemanaMadrid(new Date(Date.UTC(2026, 10, 15, 10, 0)))).toBe("2026-11-09");
  });

  it("dos martes de semanas distintas no coinciden", () => {
    const esteMartes = inicioSemanaMadrid(new Date(Date.UTC(2026, 10, 17, 10, 0)));
    const otroMartes = inicioSemanaMadrid(new Date(Date.UTC(2026, 10, 24, 10, 0)));
    expect(esteMartes).not.toBe(otroMartes);
  });
});

describe("formatFechaCorta", () => {
  it("da DD/MM/YYYY usando los getters en UTC", () => {
    // Medianoche UTC del 5 de enero — si usara getters locales en una
    // franja horaria negativa se desplazaría al día anterior.
    expect(formatFechaCorta(new Date(Date.UTC(2026, 0, 5)))).toBe("05/01/2026");
  });
});
