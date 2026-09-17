import { prisma } from "@/lib/prisma";

export async function getCuotaMensual(): Promise<number> {
  const config = await prisma.configuracionPagos.findUnique({ where: { id: 1 } });
  return config?.cuotaMensual ?? 20;
}

export async function setCuotaMensual(importe: number): Promise<void> {
  await prisma.configuracionPagos.upsert({
    where: { id: 1 },
    update: { cuotaMensual: importe },
    create: { id: 1, cuotaMensual: importe },
  });
}

// Crea la cuota del mes para cada jugador activo que todavía no la tenga
// (no pisa las que ya existen, por si el admin ya había marcado alguna como
// pagada por adelantado). Devuelve cuántas cuotas nuevas ha creado.
export async function generarCuotasDelMes(mes: string): Promise<number> {
  const importe = await getCuotaMensual();
  const activos = await prisma.user.findMany({
    where: { activo: true },
    select: { id: true },
  });
  const existentes = await prisma.cuota.findMany({
    where: { mes, userId: { in: activos.map((u) => u.id) } },
    select: { userId: true },
  });
  const yaTienen = new Set(existentes.map((c) => c.userId));
  const pendientes = activos.filter((u) => !yaTienen.has(u.id));

  if (pendientes.length === 0) return 0;

  await prisma.cuota.createMany({
    data: pendientes.map((u) => ({ userId: u.id, mes, importe })),
  });
  return pendientes.length;
}
