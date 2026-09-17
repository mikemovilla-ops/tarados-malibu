import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCuotaMensual } from "@/lib/pagos";
import { mesActual, formatMes } from "@/lib/fechas";
import SeccionAdmin from "@/components/SeccionAdmin";
import { FormCuotaMensual, FormGenerarCuotas, ToggleCuotaPagada } from "@/components/PagosAdmin";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

function mesSiguiente(mes: string, delta: number): string {
  const [anio, m] = mes.split("-").map(Number);
  const fecha = new Date(anio, m - 1 + delta, 1);
  return `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, "0")}`;
}

export default async function PagosPage({ searchParams }: { searchParams: { mes?: string } }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Pagos</h1>
        <p className="text-chalk/60">Entra con Google para ver el estado de tus cuotas.</p>
        <BotonEntrarGoogle className="bg-malibu text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-malibubright transition inline-block" />
      </div>
    );
  }

  const esAdmin = !!session.user.isAdmin;
  const cuotaMensual = await getCuotaMensual();

  if (!esAdmin) {
    const misCuotas = await prisma.cuota.findMany({
      where: { userId: session.user.id },
      orderBy: { mes: "desc" },
    });

    return (
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
        <h1 className="font-display text-2xl">Tus pagos</h1>
        <p className="text-chalk/60 text-sm">Cuota mensual actual: {cuotaMensual.toFixed(2)} €</p>
        {misCuotas.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no tienes ninguna cuota generada.</p>
        ) : (
          <div className="space-y-2">
            {misCuotas.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between">
                <span className="text-chalk capitalize">{formatMes(c.mes)}</span>
                <span className={c.pagado ? "text-malibubright text-sm" : "text-coral text-sm"}>
                  {c.pagado ? "Pagado" : `Pendiente (${c.importe.toFixed(2)} €)`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const mes = searchParams.mes && /^\d{4}-\d{2}$/.test(searchParams.mes) ? searchParams.mes : mesActual();

  const cuotas = await prisma.cuota.findMany({
    where: { mes },
    include: { user: { select: { name: true, dorsal: true } } },
    orderBy: [{ pagado: "asc" }, { user: { name: "asc" } }],
  });

  const activosSinCuota = await prisma.user.count({
    where: { activo: true, cuotas: { none: { mes } } },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl">Pagos</h1>

      <SeccionAdmin eyebrow="Configuración" titulo="Cuota mensual">
        <FormCuotaMensual importeInicial={cuotaMensual} />
      </SeccionAdmin>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Link href={`/pagos?mes=${mesSiguiente(mes, -1)}`} className="text-malibubright text-sm hover:underline">
            ← Anterior
          </Link>
          <h2 className="font-display text-lg capitalize">{formatMes(mes)}</h2>
          <Link href={`/pagos?mes=${mesSiguiente(mes, 1)}`} className="text-malibubright text-sm hover:underline">
            Siguiente →
          </Link>
        </div>

        {activosSinCuota > 0 && (
          <div className="card p-4 space-y-2">
            <p className="text-chalk/70 text-sm">
              {activosSinCuota} jugador{activosSinCuota !== 1 ? "es" : ""} activo{activosSinCuota !== 1 ? "s" : ""} sin cuota generada este mes.
            </p>
            <FormGenerarCuotas mes={mes} />
          </div>
        )}

        {cuotas.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay cuotas generadas para este mes todavía.</p>
        ) : (
          <div className="space-y-2">
            {cuotas.map((c) => (
              <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
                <span className="text-chalk truncate">
                  {c.user.dorsal !== null && <span className="text-malibubright font-display">#{c.user.dorsal} </span>}
                  {c.user.name ?? "Sin nombre"}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-chalk/50 text-xs">{c.importe.toFixed(2)} €</span>
                  <ToggleCuotaPagada cuotaId={c.id} pagadoInicial={c.pagado} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
