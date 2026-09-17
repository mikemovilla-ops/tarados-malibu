import type { TipoPago } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const TIPOS_PAGO: TipoPago[] = ["INSCRIPCION", "EQUIPACION", "MATERIAL"];

export const ETIQUETA_TIPO_PAGO: Record<TipoPago, string> = {
  INSCRIPCION: "Inscripción",
  EQUIPACION: "Equipación",
  MATERIAL: "Material",
};

export async function getImportePago(tipo: TipoPago): Promise<number> {
  const config = await prisma.configuracionPago.findUnique({ where: { tipo } });
  return config?.importe ?? 0;
}

export async function setImportePago(tipo: TipoPago, importe: number): Promise<void> {
  await prisma.configuracionPago.upsert({
    where: { tipo },
    update: { importe },
    create: { tipo, importe },
  });
}
