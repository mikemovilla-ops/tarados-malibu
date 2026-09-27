import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getViewer } from "@/lib/viewer";
import { estaAlDiaDePago } from "@/lib/pagos";
import { puedeEscribirForo } from "@/lib/foro";
import MensajeForo from "@/components/MensajeForo";
import FormNuevoMensajeForo from "@/components/FormNuevoMensajeForo";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function ForoPage() {
  const viewer = await getViewer();

  if (!viewer.session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Foro</h1>
        <p className="text-chalk/60">Entra con Google para ver y participar en el foro.</p>
        <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
      </div>
    );
  }

  // No dejamos entrar a nadie que todavía no haya dicho si es jugador: por
  // defecto trae rol JUGADOR, y le dejaría escribir como tal antes de
  // haberlo confirmado. RedireccionPrimerLogin ya intenta mandarlo a
  // Ajustes en el cliente, pero esto lo cierra también en el servidor
  // (entrando directo por URL, o si el JS aún no ha corrido).
  if (viewer.necesitaElegirRol) {
    redirect("/ajustes");
  }

  // viewer.alDiaDePago solo viene forzado durante una vista previa de
  // socio; en cualquier otro caso hay que calcularlo de verdad.
  const alDiaDePago =
    viewer.alDiaDePago ?? (viewer.rol === "SOCIO" ? await estaAlDiaDePago(viewer.userId!, "SOCIO") : true);
  const puedeEscribir = puedeEscribirForo({ logueado: !!viewer.session, rol: viewer.rol, alDiaDePago });

  const temas = await prisma.mensajeForo.findMany({
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
        <h1 className="font-display text-2xl">Foro</h1>
        <p className="text-chalk/60 text-sm">Preguntas, propuestas o lo que sea — para todo el equipo.</p>
      </div>

      {puedeEscribir ? (
        <div className="card p-4">
          <FormNuevoMensajeForo placeholder="Abre un tema nuevo..." />
        </div>
      ) : (
        <div className="card p-4 border-coral/40">
          <p className="text-coral text-sm">
            Para participar en el foro hace falta estar al día con la cuota de socio — puedes pagarla en{" "}
            <Link href="/pagos" className="underline">
              Pagos
            </Link>
            .
          </p>
        </div>
      )}

      {temas.length === 0 ? (
        <p className="text-chalk/50 text-sm">Todavía no hay ningún mensaje. Sé el primero.</p>
      ) : (
        <div className="space-y-3">
          {temas.map((tema) => (
            <MensajeForo key={tema.id} tema={tema} esAdmin={viewer.esAdmin} puedeEscribir={puedeEscribir} />
          ))}
        </div>
      )}
    </div>
  );
}
