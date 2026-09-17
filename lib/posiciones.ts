import type { Posicion } from "@prisma/client";

export const POSICIONES: Posicion[] = ["PORTERO", "DEFENSA", "CENTROCAMPISTA", "DELANTERO"];

export const ETIQUETA_POSICION: Record<Posicion, string> = {
  PORTERO: "Portero",
  DEFENSA: "Defensa",
  CENTROCAMPISTA: "Centrocampista",
  DELANTERO: "Delantero",
};
