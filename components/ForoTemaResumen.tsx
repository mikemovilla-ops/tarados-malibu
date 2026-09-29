import Link from "next/link";
import { nombreMostrado } from "@/lib/jugadores";
import { formatFechaHora } from "@/lib/fechas";
import BotonBorrarMensajeForo from "@/components/BotonBorrarMensajeForo";

type Autor = { name: string | null; apodo: string | null };

// Fila de la lista de temas en /foro — el debate en sí (respuestas) vive en
// la página propia del tema, no aquí.
export default function ForoTemaResumen({
  id,
  titulo,
  texto,
  createdAt,
  ultimaActividad,
  autor,
  numRespuestas,
  noLeido,
  puedeBorrar,
}: {
  id: string;
  // Puede faltar en temas creados antes de añadir el título.
  titulo: string | null;
  texto: string;
  createdAt: Date;
  ultimaActividad: Date;
  autor: Autor;
  numRespuestas: number;
  // Sin abrir todavía, o con actividad nueva desde la última visita.
  noLeido: boolean;
  // Admin siempre; el propio autor solo si nadie ha respondido todavía.
  puedeBorrar: boolean;
}) {
  return (
    <Link
      href={`/foro/${id}`}
      className={`card p-4 block space-y-1 hover:border-amarillo/40 transition ${noLeido ? "border-amarillo/50" : ""}`}
    >
      <p className="font-display text-chalk flex items-center gap-2 min-w-0">
        {noLeido && <span className="w-2 h-2 rounded-full bg-amarillobrillante shrink-0" />}
        <span className="truncate min-w-0">{titulo ?? texto}</span>
      </p>
      <div className="flex items-center justify-between gap-2">
        <span className="text-chalk/60 text-xs">{nombreMostrado(autor)}</span>
        <span className="text-chalk/40 text-xs shrink-0">{formatFechaHora(createdAt)}</span>
      </div>
      {titulo && <p className="text-chalk/70 text-sm line-clamp-2">{texto}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-chalk/40 text-xs">
          {numRespuestas === 0
            ? "Sin respuestas"
            : `${numRespuestas} respuesta${numRespuestas === 1 ? "" : "s"} · última ${formatFechaHora(ultimaActividad)}`}
        </p>
        {puedeBorrar && <BotonBorrarMensajeForo id={id} esTema />}
      </div>
    </Link>
  );
}
