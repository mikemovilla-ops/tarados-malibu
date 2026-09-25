import type { Rol } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type Seccion = { id: string; nombre: string; importe: number; orden: number; destinatario: Rol };

// Sin `destinatario` trae las secciones de jugadores y de socios juntas
// (lo necesita la vista admin, que muestra los dos grupos a la vez).
export async function getSecciones(destinatario?: Rol): Promise<Seccion[]> {
  return prisma.seccionPago.findMany({
    where: destinatario ? { destinatario } : undefined,
    orderBy: { orden: "asc" },
  });
}

export async function crearSeccion(nombre: string, importe: number, destinatario: Rol): Promise<Seccion> {
  const ultima = await prisma.seccionPago.findFirst({ where: { destinatario }, orderBy: { orden: "desc" } });
  return prisma.seccionPago.create({
    data: { nombre, importe, destinatario, orden: (ultima?.orden ?? -1) + 1 },
  });
}

export async function actualizarImporteSeccion(seccionId: string, importe: number): Promise<void> {
  await prisma.seccionPago.update({ where: { id: seccionId }, data: { importe } });
}

// "Al día" = tiene un Pago con pagado=true para cada sección de su grupo
// (jugador o socio). Sin secciones no hay nada pendiente, así que cuenta
// como al día (every() de un array vacío ya da true).
export function todasSeccionesPagadas(
  secciones: { id: string }[],
  pagos: { seccionId: string; pagado: boolean }[]
): boolean {
  return secciones.every((s) => pagos.find((p) => p.seccionId === s.id)?.pagado === true);
}

export async function estaAlDiaDePago(userId: string, destinatario: Rol): Promise<boolean> {
  const secciones = await getSecciones(destinatario);
  const pagos = await prisma.pago.findMany({
    where: { userId, seccionId: { in: secciones.map((s) => s.id) } },
  });

  return todasSeccionesPagadas(secciones, pagos);
}
