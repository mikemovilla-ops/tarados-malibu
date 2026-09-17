import { calcularRanking } from "@/lib/estadisticas";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage() {
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
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-chalk/50 text-left border-b border-chalk/10">
                <th className="py-2 pl-4 font-normal">Jugador</th>
                <th className="py-2 px-2 font-normal text-center">PJ</th>
                <th className="py-2 px-2 font-normal text-center">Goles</th>
                <th className="py-2 px-2 font-normal text-center">Asist.</th>
                <th className="py-2 px-2 font-normal text-center">🟨</th>
                <th className="py-2 pr-4 font-normal text-center">🟥</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-chalk/10">
              {ranking.map((fila) => (
                <tr key={fila.userId}>
                  <td className="py-2 pl-4 text-chalk">
                    {fila.dorsal !== null && <span className="text-amarillobrillante font-display">#{fila.dorsal} </span>}
                    {fila.nombre}
                  </td>
                  <td className="py-2 px-2 text-center text-chalk/70">{fila.partidosJugados}</td>
                  <td className="py-2 px-2 text-center text-amarillobrillante font-display">{fila.goles}</td>
                  <td className="py-2 px-2 text-center text-chalk/70">{fila.asistencias}</td>
                  <td className="py-2 px-2 text-center text-chalk/70">{fila.tarjetasAmarillas || ""}</td>
                  <td className="py-2 pr-4 text-center text-coral/80">{fila.tarjetasRojas || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
