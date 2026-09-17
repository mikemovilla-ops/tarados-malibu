import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TIPOS_PAGO, ETIQUETA_TIPO_PAGO, getImportePago } from "@/lib/pagos";
import { nombreMostrado } from "@/lib/jugadores";
import SeccionAdmin from "@/components/SeccionAdmin";
import { FormImportePago, TogglePago } from "@/components/PagosAdmin";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function PagosPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Pagos</h1>
        <p className="text-chalk/60">Entra con Google para ver el estado de tus pagos.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  const esAdmin = !!session.user.isAdmin;
  const importes: Record<string, number> = {};
  for (const tipo of TIPOS_PAGO) importes[tipo] = await getImportePago(tipo);

  if (!esAdmin) {
    const usuario = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id }, select: { estado: true } });

    if (usuario.estado !== "ACTIVO") {
      return (
        <div className="max-w-2xl mx-auto px-4 py-10 space-y-3">
          <h1 className="font-display text-2xl">Pagos</h1>
          <p className="text-chalk/50 text-sm">Los pagos del equipo son solo para jugadores activos.</p>
        </div>
      );
    }

    const misPagos = await prisma.pago.findMany({ where: { userId: session.user.id } });

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="font-display text-2xl">Tus pagos</h1>
        <div className="space-y-2">
          {TIPOS_PAGO.map((tipo) => {
            const pago = misPagos.find((p) => p.tipo === tipo);
            const pagado = pago?.pagado ?? false;
            const importe = pago?.importe ?? importes[tipo];
            return (
              <div key={tipo} className="card p-4 flex items-center justify-between">
                <span className="text-chalk">{ETIQUETA_TIPO_PAGO[tipo]}</span>
                <span className={pagado ? "text-amarillobrillante text-sm" : "text-coral text-sm"}>
                  {pagado ? "Pagado" : `Pendiente (${importe.toFixed(2)} €)`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const activos = await prisma.user.findMany({
    where: { estado: "ACTIVO" },
    orderBy: [{ dorsal: "asc" }, { name: "asc" }],
    select: { id: true, name: true, apodo: true, dorsal: true },
  });

  const pagos = await prisma.pago.findMany({ where: { userId: { in: activos.map((a) => a.id) } } });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl">Pagos</h1>
      <p className="text-chalk/60 text-sm">{activos.length} jugadores activos</p>

      {TIPOS_PAGO.map((tipo) => (
        <SeccionAdmin key={tipo} eyebrow="Sección" titulo={ETIQUETA_TIPO_PAGO[tipo]}>
          <FormImportePago tipo={tipo} importeInicial={importes[tipo]} />
          {activos.length === 0 ? (
            <p className="text-chalk/50 text-sm">No hay jugadores activos todavía.</p>
          ) : (
            <div className="space-y-2 pt-2">
              {activos.map((j) => {
                const pago = pagos.find((p) => p.userId === j.id && p.tipo === tipo);
                return (
                  <div key={j.id} className="flex items-center justify-between gap-3">
                    <span className="text-chalk text-sm truncate">
                      {j.dorsal !== null && <span className="text-amarillobrillante font-display">#{j.dorsal} </span>}
                      {nombreMostrado(j)}
                    </span>
                    <TogglePago userId={j.id} tipo={tipo} pagadoInicial={pago?.pagado ?? false} />
                  </div>
                );
              })}
            </div>
          )}
        </SeccionAdmin>
      ))}
    </div>
  );
}
