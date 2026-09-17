import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ETIQUETA_POSICION } from "@/lib/posiciones";
import EditarTelefono from "@/components/EditarTelefono";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
        <h1 className="font-display text-2xl">Ajustes</h1>
        <p className="text-chalk/60">Entra con Google para ver y editar tus datos.</p>
        <BotonEntrarGoogle className="bg-malibu text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-malibubright transition inline-block" />
      </div>
    );
  }

  const usuario = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: { name: true, email: true, dorsal: true, posicion: true, telefono: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="font-display text-2xl">Ajustes</h1>

      <section className="card p-5 space-y-1">
        <p className="text-chalk">{usuario.name}</p>
        <p className="text-chalk/50 text-sm">{usuario.email}</p>
        <p className="text-chalk/50 text-sm">
          {usuario.dorsal !== null ? `Dorsal #${usuario.dorsal}` : "Sin dorsal asignado"}
          {" · "}
          {usuario.posicion ? ETIQUETA_POSICION[usuario.posicion] : "Sin posición"}
        </p>
        <p className="text-chalk/40 text-xs pt-1">
          El dorsal y la posición los gestiona el admin desde Plantilla.
        </p>
      </section>

      <section className="card p-5 space-y-2">
        <h2 className="font-display text-base">Teléfono de contacto</h2>
        <EditarTelefono telefonoInicial={usuario.telefono ?? ""} />
      </section>
    </div>
  );
}
