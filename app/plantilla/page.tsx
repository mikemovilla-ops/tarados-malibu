import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FilaJugador from "@/components/FilaJugador";

export const dynamic = "force-dynamic";

export default async function PlantillaPage() {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  const jugadores = await prisma.user.findMany({
    orderBy: [{ activo: "desc" }, { dorsal: "asc" }, { name: "asc" }],
    select: { id: true, name: true, image: true, dorsal: true, posicion: true, activo: true },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-4">
      <div>
        <h1 className="font-display text-2xl">Plantilla</h1>
        <p className="text-chalk/60 text-sm">
          {jugadores.filter((j) => j.activo).length} jugadores activos
        </p>
      </div>

      {jugadores.length === 0 && (
        <p className="text-chalk/50 text-sm">
          Todavía no ha entrado nadie con Google. Los jugadores aparecen aquí en cuanto se registran.
        </p>
      )}

      <div className="space-y-2">
        {jugadores.map((j) => (
          <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
        ))}
      </div>
    </div>
  );
}
