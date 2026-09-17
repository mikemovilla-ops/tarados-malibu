import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatFechaHora } from "@/lib/fechas";
import ConvocatoriaEditor from "@/components/ConvocatoriaEditor";
import ResultadoEditor from "@/components/ResultadoEditor";

export const dynamic = "force-dynamic";

export default async function PartidoPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  const partido = await prisma.partido.findUnique({
    where: { id: params.id },
    include: { convocatorias: { include: { user: { select: { id: true, name: true, dorsal: true, image: true } } } } },
  });

  if (!partido) notFound();

  const jugadores = esAdmin
    ? await prisma.user.findMany({
        where: { activo: true },
        orderBy: [{ dorsal: "asc" }, { name: "asc" }],
        select: { id: true, name: true, dorsal: true },
      })
    : [];

  const convocatoriaInicial: Record<string, { convocado: boolean; titular: boolean; goles: number; asistencias: number }> = {};
  for (const c of partido.convocatorias) {
    convocatoriaInicial[c.userId] = { convocado: c.convocado, titular: c.titular, goles: c.goles, asistencias: c.asistencias };
  }

  const convocados = partido.convocatorias.filter((c) => c.convocado);
  const jugado = partido.golesFavor !== null && partido.golesContra !== null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl">
          {partido.esLocal ? "Tarados Malibú" : partido.rival} vs {partido.esLocal ? partido.rival : "Tarados Malibú"}
        </h1>
        <p className="text-chalk/60 text-sm">
          {formatFechaHora(partido.fecha)} · {partido.competicion}
          {partido.lugar && ` · ${partido.lugar}`}
        </p>
        {jugado && (
          <p className="font-display text-3xl text-malibubright pt-2">
            {partido.esLocal ? partido.golesFavor : partido.golesContra} - {partido.esLocal ? partido.golesContra : partido.golesFavor}
          </p>
        )}
        {partido.notas && <p className="text-chalk/60 text-sm pt-1">{partido.notas}</p>}
      </div>

      {esAdmin && (
        <section className="card p-4 space-y-2">
          <h2 className="font-display text-base">Resultado</h2>
          <ResultadoEditor
            partidoId={partido.id}
            golesFavorInicial={partido.golesFavor}
            golesContraInicial={partido.golesContra}
            notasIniciales={partido.notas}
          />
        </section>
      )}

      <section className="card p-4 space-y-3">
        <h2 className="font-display text-base">Convocatoria {esAdmin ? "" : `(${convocados.length})`}</h2>
        {esAdmin ? (
          <ConvocatoriaEditor partidoId={partido.id} jugadores={jugadores} convocatoriaInicial={convocatoriaInicial} />
        ) : convocados.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay convocatoria para este partido.</p>
        ) : (
          <div className="space-y-1.5 text-sm">
            {convocados.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-chalk/80">
                  {c.user.dorsal !== null && `#${c.user.dorsal} `}
                  {c.user.name ?? "Sin nombre"}
                  {c.titular && <span className="text-chalk/40 text-xs"> · titular</span>}
                </span>
                {(c.goles > 0 || c.asistencias > 0) && (
                  <span className="text-chalk/50 text-xs">
                    {c.goles > 0 && `${c.goles} gol${c.goles !== 1 ? "es" : ""}`}
                    {c.goles > 0 && c.asistencias > 0 && " · "}
                    {c.asistencias > 0 && `${c.asistencias} asist.`}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
