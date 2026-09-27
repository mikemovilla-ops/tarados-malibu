// Puede participar (abrir temas, responder) un jugador (activo o ayuda)
// siempre, y un socio si está al día de su cuota. Un "no jugador" (ha
// contestado que no juega pero todavía no paga nada) no puede, aunque
// vuelva a estar logueado: para participar necesita que el admin le
// registre el pago, momento en el que pasa a ser socio automáticamente
// (ver app/api/pagos/route.ts).
export function puedeEscribirForo({
  logueado,
  rol,
  alDiaDePago,
}: {
  logueado: boolean;
  rol: "JUGADOR" | "SOCIO" | "NO_JUGADOR" | null;
  alDiaDePago: boolean;
}): boolean {
  if (!logueado) return false;
  if (rol === "NO_JUGADOR") return false;
  if (rol === "SOCIO") return alDiaDePago;
  return true;
}
