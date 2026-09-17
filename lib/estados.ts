import type { EstadoJugador } from "@prisma/client";

export const ESTADOS: EstadoJugador[] = ["ACTIVO", "AYUDA"];

export const ETIQUETA_ESTADO: Record<EstadoJugador, string> = {
  ACTIVO: "Activo",
  AYUDA: "Ayuda",
};
