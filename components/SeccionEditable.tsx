"use client";

import { useState } from "react";

// Envoltorio genérico: muestra `resumen` (lo mismo que vería un usuario
// normal) con un botón "Editar" que revela `children` (los controles de
// admin) — pensado para partidos con la jornada ya cerrada, donde el admin
// solo debería tocar algo si de verdad hace falta corregir un error.
export default function SeccionEditable({
  resumen,
  children,
}: {
  resumen: React.ReactNode;
  children: React.ReactNode;
}) {
  const [editando, setEditando] = useState(false);

  if (editando) {
    return (
      <div className="space-y-2">
        {children}
        <button onClick={() => setEditando(false)} className="text-chalk/50 text-xs hover:underline">
          Dejar de editar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {resumen}
      <button onClick={() => setEditando(true)} className="text-amarillobrillante text-xs hover:underline">
        Editar
      </button>
    </div>
  );
}
