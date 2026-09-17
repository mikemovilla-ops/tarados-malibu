// El apodo (elegido por el propio jugador en Ajustes) manda sobre el nombre
// de Google en todas las pantallas de equipo — así un jugador puede
// aparecer como le llama el grupo en vez de con su nombre real.
export function nombreMostrado(jugador: { name: string | null; apodo?: string | null }): string {
  return jugador.apodo || jugador.name || "Sin nombre";
}
