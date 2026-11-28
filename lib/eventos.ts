import { prisma } from "@/lib/prisma";

// Deja una línea en el registro de actividad del partido (ver EventoPartido
// en el esquema) — nunca debe romper la acción real que lo dispara (que
// alguien haya guardado su disponibilidad o su pizza ya es lo importante),
// así que un fallo aquí solo se registra en consola.
export async function registrarEvento(partidoId: string, texto: string) {
  try {
    await prisma.eventoPartido.create({ data: { partidoId, texto } });
  } catch (e) {
    console.error("No se pudo registrar el evento del partido:", e);
  }
}
