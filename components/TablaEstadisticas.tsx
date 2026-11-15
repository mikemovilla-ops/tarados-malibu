"use client";

import { useState } from "react";
import EnlaceConCarga from "@/components/EnlaceConCarga";
import type { FilaEstadistica } from "@/lib/estadisticas";

type ColumnaNumerica = Exclude<keyof FilaEstadistica, "userId" | "nombre" | "dorsal">;
type Columna = "nombre" | ColumnaNumerica;

const COLUMNAS: { clave: Columna; etiqueta: string; titulo?: string }[] = [
  { clave: "nombre", etiqueta: "Jugador" },
  { clave: "partidosJugados", etiqueta: "PJ", titulo: "Partidos jugados" },
  { clave: "goles", etiqueta: "⚽", titulo: "Goles" },
  { clave: "asistencias", etiqueta: "🥾", titulo: "Asistencias" },
  { clave: "tarjetasAmarillas", etiqueta: "🟨", titulo: "Tarjetas amarillas" },
  { clave: "tarjetasRojas", etiqueta: "🟥", titulo: "Tarjetas rojas" },
  { clave: "golesEncajados", etiqueta: "🧤", titulo: "Goles encajados de portero" },
  { clave: "vecesEssenzal", etiqueta: "🏆", titulo: "Veces elegido Jugador Essenzal" },
  { clave: "vecesVayaDia", etiqueta: "🙈", titulo: "Veces elegido ¡Vaya día!" },
];

// Clic en una cabecera ordena por esa columna; un segundo clic en la misma
// invierte el sentido. Por defecto empieza igual que antes (más partidos
// jugados primero, el resto de criterios de calcularRanking se pierden al
// reordenar a mano, pero eso es justo lo que se pide: que decida quien mira
// la tabla, no un orden fijo).
export default function TablaEstadisticas({ ranking }: { ranking: FilaEstadistica[] }) {
  const [orden, setOrden] = useState<{ columna: Columna; direccion: "asc" | "desc" }>({
    columna: "partidosJugados",
    direccion: "desc",
  });

  function cambiarOrden(columna: Columna) {
    setOrden((prev) =>
      prev.columna === columna
        ? { columna, direccion: prev.direccion === "desc" ? "asc" : "desc" }
        : { columna, direccion: columna === "nombre" ? "asc" : "desc" }
    );
  }

  const filas = [...ranking].sort((a, b) => {
    const factor = orden.direccion === "asc" ? 1 : -1;
    if (orden.columna === "nombre") return factor * a.nombre.localeCompare(b.nombre);
    const campo = orden.columna;
    return factor * (a[campo] - b[campo]);
  });

  return (
    <div className="card overflow-hidden overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-chalk/50 text-left border-b border-chalk/10">
            {COLUMNAS.map((col, i) => (
              <th
                key={col.clave}
                title={col.titulo}
                onClick={() => cambiarOrden(col.clave)}
                className={`py-2 font-normal select-none cursor-pointer hover:text-chalk transition ${
                  i === 0 ? "pl-4 text-left" : "px-2 text-center"
                } ${i === COLUMNAS.length - 1 ? "pr-4" : ""} ${
                  orden.columna === col.clave ? "text-amarillobrillante" : ""
                }`}
              >
                {col.etiqueta}
                {orden.columna === col.clave && (orden.direccion === "asc" ? " ▲" : " ▼")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-chalk/10">
          {filas.map((fila) => (
            <tr key={fila.userId} className="hover:bg-chalk/5 transition">
              <td className="py-2 pl-4 text-chalk">
                <EnlaceConCarga href={`/plantilla/${fila.userId}`} className="hover:underline">
                  {fila.dorsal !== null && <span className="text-amarillobrillante font-display">#{fila.dorsal} </span>}
                  {fila.nombre}
                </EnlaceConCarga>
              </td>
              <td className="py-2 px-2 text-center text-chalk/70">{fila.partidosJugados}</td>
              <td className="py-2 px-2 text-center text-amarillobrillante font-display">{fila.goles}</td>
              <td className="py-2 px-2 text-center text-chalk/70">{fila.asistencias}</td>
              <td className="py-2 px-2 text-center text-chalk/70">{fila.tarjetasAmarillas || ""}</td>
              <td className="py-2 px-2 text-center text-coral/80">{fila.tarjetasRojas || ""}</td>
              <td className="py-2 px-2 text-center text-chalk/70">{fila.golesEncajados || ""}</td>
              <td className="py-2 px-2 text-center text-amarillobrillante">{fila.vecesEssenzal || ""}</td>
              <td className="py-2 pr-4 text-center text-chalk/70">{fila.vecesVayaDia || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
