import { prisma } from "@/lib/prisma";

export type Seccion = { id: string; nombre: string; importe: number; orden: number };

export async function getSecciones(): Promise<Seccion[]> {
  return prisma.seccionPago.findMany({ orderBy: { orden: "asc" } });
}

export async function crearSeccion(nombre: string, importe: number): Promise<Seccion> {
  const ultima = await prisma.seccionPago.findFirst({ orderBy: { orden: "desc" } });
  return prisma.seccionPago.create({
    data: { nombre, importe, orden: (ultima?.orden ?? -1) + 1 },
  });
}

export async function actualizarImporteSeccion(seccionId: string, importe: number): Promise<void> {
  await prisma.seccionPago.update({ where: { id: seccionId }, data: { importe } });
}
