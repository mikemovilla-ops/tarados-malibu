"use client";

// Campos compartidos por el formulario de crear partido y el de editarlo,
// para no duplicar el layout en los dos sitios.
export default function CamposPartido({
  fecha,
  setFecha,
  rival,
  setRival,
  esLocal,
  setEsLocal,
  competicion,
  setCompeticion,
  jornada,
  setJornada,
  lugar,
  setLugar,
}: {
  fecha: string;
  setFecha: (v: string) => void;
  rival: string;
  setRival: (v: string) => void;
  esLocal: boolean;
  setEsLocal: (v: boolean) => void;
  competicion: string;
  setCompeticion: (v: string) => void;
  jornada: string;
  setJornada: (v: string) => void;
  lugar: string;
  setLugar: (v: string) => void;
}) {
  const esLiga = competicion.trim().toLowerCase() === "liga";

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Fecha y hora</span>
          <input
            type="datetime-local"
            required
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Rival</span>
          <input
            required
            value={rival}
            onChange={(e) => setRival(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Competición</span>
          <input
            value={competicion}
            onChange={(e) => setCompeticion(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
        {esLiga && (
          <label className="space-y-1">
            <span className="text-chalk/60 text-xs">Jornada</span>
            <input
              type="number"
              min={1}
              value={jornada}
              onChange={(e) => setJornada(e.target.value)}
              className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
            />
          </label>
        )}
        <label className="space-y-1">
          <span className="text-chalk/60 text-xs">Lugar (opcional)</span>
          <input
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full bg-pitchdark border border-chalk/20 rounded px-2 py-1.5 text-chalk"
          />
        </label>
      </div>
      <label className="flex items-center gap-1.5 text-chalk/70">
        <input type="checkbox" checked={esLocal} onChange={(e) => setEsLocal(e.target.checked)} />
        Jugamos en casa
      </label>
    </>
  );
}
