"use client";

import { useState, type ReactNode } from "react";

// Separa el detalle de un partido en lo que ve cualquiera ("General") y las
// herramientas de admin ("Zona admin") — si quien mira no es admin, ni
// siquiera se monta la pestaña de admin (viene undefined desde el servidor),
// así que no hay ni rastro de ella en el HTML.
export default function PestanasPartido({ general, admin }: { general: ReactNode; admin?: ReactNode }) {
  const [tab, setTab] = useState<"general" | "admin">("general");

  if (!admin) return <>{general}</>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setTab("general")}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === "general" ? "bg-amarillo text-pitchdark" : "bg-pitchdark border border-chalk/20 text-chalk/60"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setTab("admin")}
          className={`px-3 py-1.5 rounded-md transition ${
            tab === "admin" ? "bg-amarillo text-pitchdark" : "bg-pitchdark border border-chalk/20 text-chalk/60"
          }`}
        >
          Zona admin
        </button>
      </div>
      <div className="space-y-6">{tab === "general" ? general : admin}</div>
    </div>
  );
}
