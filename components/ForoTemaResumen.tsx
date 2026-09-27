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
  // Admin siempre; el propio autor solo si nadie ha respondido todavía.
  puedeBorrar: boolean;
}) {
  return (
    <Link href={`/foro/${id}`} className="card p-4 block space-y-1 hover:border-amarillo/40 transition">
      <p className="font-display text-chalk truncate">{titulo ?? texto}</p>
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
