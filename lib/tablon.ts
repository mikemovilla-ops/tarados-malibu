// Un socio con alguna cuota de socio pendiente puede leer el tablón pero
// no escribir; un jugador (en cualquier estado) no tiene esa limitación.
// Hay que estar logueado en cualquier caso.
export function puedeEscribirTablon({
  logueado,
  rol,
  alDiaDePago,
}: {
  logueado: boolean;
  rol: "JUGADOR" | "SOCIO" | null;
  alDiaDePago: boolean;
}): boolean {
  if (!logueado) return false;
  if (rol === "SOCIO") return alDiaDePago;
  return true;
}
