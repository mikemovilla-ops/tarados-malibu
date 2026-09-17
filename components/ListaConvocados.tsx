import { nombreMostrado } from "@/lib/jugadores";

type Convocado = {
  id: string;
  goles: number;
  asistencias: number;
  tarjetaAmarilla: boolean;
  tarjetaRoja: boolean;
  user: { name: string | null; apodo: string | null; dorsal: number | null };
};

// Vista de solo lectura de la convocatoria — la misma que ve cualquier
// jugador, reutilizada también para el admin cuando la jornada ya está
// cerrada (ver SeccionEditable en app/calendario/[id]/page.tsx).
export default function ListaConvocados({ convocados }: { convocados: Convocado[] }) {
  if (convocados.length === 0) {
    return <p className="text-chalk/50 text-sm">Todavía no hay convocatoria para este partido.</p>;
  }

  return (
    <div className="space-y-1.5 text-sm">
      {convocados.map((c) => (
        <div key={c.id} className="flex items-center flex-wrap gap-x-2">
          <span className="text-chalk/80">
            {c.user.dorsal !== null && `#${c.user.dorsal} `}
            {nombreMostrado(c.user)}
          </span>
          {(c.goles > 0 || c.asistencias > 0 || c.tarjetaAmarilla || c.tarjetaRoja) && (
            <span className="text-xs tracking-wide">
              {c.goles > 0 && "⚽".repeat(c.goles)}
              {c.asistencias > 0 && ` ${"🥾".repeat(c.asistencias)}`}
              {c.tarjetaAmarilla && " 🟨"}
              {c.tarjetaRoja && " 🟥"}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
