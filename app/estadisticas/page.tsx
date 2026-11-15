import { calcularRanking } from "@/lib/estadisticas";
import { getViewer, puedeVerDetalles } from "@/lib/viewer";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";
import TablaEstadisticas from "@/components/TablaEstadisticas";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
  const { session, rol } = await getViewer();

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Estadísticas</h1>
        <p className="text-chalk/60">Entra con Google para verlas.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  // Un "no jugador" (sin clasificar todavía) no ve las estadísticas —
  // mismo bloqueo que la ficha de cada jugador y el detalle de un partido.
  if (!puedeVerDetalles(rol)) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Estadísticas</h1>
        <p className="text-chalk/60">Todavía no puedes ver esto — pídele al admin que te clasifique primero.</p>
      </div>
    );
  }

  const ranking = await calcularRanking();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div>
        <h1 className="font-display text-2xl">Estadísticas</h1>
        <p className="text-chalk/40 text-xs pt-1">Solo cuentan los partidos con la jornada ya cerrada por el admin.</p>
      </div>

      {ranking.length === 0 ? (
        <p className="text-chalk/50 text-sm">Todavía no hay datos de partidos jugados (o ninguna jornada cerrada).</p>
      ) : (
        <TablaEstadisticas ranking={ranking} />
      )}
    </div>
  );
}
