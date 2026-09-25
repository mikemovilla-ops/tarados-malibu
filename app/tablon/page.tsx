import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
import { estaAlDiaDePago } from "@/lib/pagos";
import { puedeEscribirTablon } from "@/lib/tablon";
import MensajeTablon from "@/components/MensajeTablon";
import FormNuevoMensajeTablon from "@/components/FormNuevoMensajeTablon";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function TablonPage() {
  const viewer = await getViewer();

  if (!viewer.session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Tablón</h1>
        <p className="text-chalk/60">Entra con Google para ver y participar en el tablón.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  // viewer.alDiaDePago solo viene forzado durante una vista previa de
  // socio; en cualquier otro caso hay que calcularlo de verdad.
  const alDiaDePago =
    viewer.alDiaDePago ?? (viewer.rol === "SOCIO" ? await estaAlDiaDePago(viewer.userId!, "SOCIO") : true);
  const puedeEscribir = puedeEscribirTablon({ logueado: !!viewer.session, rol: viewer.rol, alDiaDePago });

  const temas = await prisma.mensajeTablon.findMany({
    where: { padreId: null },
    orderBy: { createdAt: "desc" },
    include: {
      autor: { select: { name: true, apodo: true } },
      respuestas: {
        orderBy: { createdAt: "asc" },
        include: { autor: { select: { name: true, apodo: true } } },
      },
    },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="font-display text-2xl">Tablón</h1>
        <p className="text-chalk/60 text-sm">Preguntas, propuestas o lo que sea — para todo el equipo.</p>
      </div>

      {puedeEscribir ? (
        <div className="card p-4">
          <FormNuevoMensajeTablon placeholder="Abre un tema nuevo..." />
        </div>
      ) : (
        <div className="card p-4 border-coral/40">
          <p className="text-coral text-sm">
            Tienes alguna cuota de socio pendiente — ponte al día en{" "}
            <Link href="/pagos" className="underline">
              Pagos
            </Link>{" "}
            para poder escribir en el tablón.
          </p>
        </div>
      )}

      {temas.length === 0 ? (
        <p className="text-chalk/50 text-sm">Todavía no hay ningún mensaje. Sé el primero.</p>
      ) : (
        <div className="space-y-3">
          {temas.map((tema) => (
            <MensajeTablon key={tema.id} tema={tema} esAdmin={viewer.esAdmin} puedeEscribir={puedeEscribir} />
          ))}
        </div>
      )}
    </div>
  );
}
