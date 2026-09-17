import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import FormNuevoPartido from "@/components/FormNuevoPartido";

export const dynamic = "force-dynamic";

export default async function CalendarioPage() {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  const partidos = await prisma.partido.findMany({ orderBy: { fecha: "asc" } });
  const ahora = new Date();
  const proximos = partidos.filter((p) => p.fecha >= ahora);
  const pasados = partidos.filter((p) => p.fecha < ahora).reverse();

  function FilaPartido({ p }: { p: (typeof partidos)[number] }) {
    const jugado = p.golesFavor !== null && p.golesContra !== null;
    return (
      <Link href={`/calendario/${p.id}`} className="card p-4 flex items-center justify-between gap-3 hover:border-malibu/40 transition">
        <div className="min-w-0">
          <p className="text-chalk truncate">
            {p.esLocal ? "Tarados Malibú" : p.rival} vs {p.esLocal ? p.rival : "Tarados Malibú"}
          </p>
          <p className="text-chalk/50 text-xs">
            {formatFechaHora(p.fecha)} · {p.competicion}
          </p>
        </div>
        {jugado && (
          <p className="font-display text-lg text-malibubright shrink-0">
            {p.esLocal ? p.golesFavor : p.golesContra} - {p.esLocal ? p.golesContra : p.golesFavor}
          </p>
        )}
      </Link>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl">Calendario</h1>
        {esAdmin && <FormNuevoPartido />}
      </div>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay partidos programados.</p>
        ) : (
          <div className="space-y-2">
            {proximos.map((p) => (
              <FilaPartido key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Jugados</h2>
        {pasados.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay partidos jugados.</p>
        ) : (
          <div className="space-y-2">
            {pasados.map((p) => (
              <FilaPartido key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
