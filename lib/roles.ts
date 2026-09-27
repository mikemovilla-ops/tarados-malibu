import type { Rol } from "@prisma/client";

export const ROLES: Rol[] = ["JUGADOR", "SOCIO", "NO_JUGADOR"];

export const ETIQUETA_ROL: Record<Rol, string> = {
  JUGADOR: "Jugador",
  SOCIO: "Socio",
  NO_JUGADOR: "No jugador",
};
