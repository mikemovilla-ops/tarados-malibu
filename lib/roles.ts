import type { Rol } from "@prisma/client";

export const ROLES: Rol[] = ["JUGADOR", "SOCIO"];

export const ETIQUETA_ROL: Record<Rol, string> = {
  JUGADOR: "Jugador",
  SOCIO: "Socio",
};
