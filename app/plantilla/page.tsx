import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import FilaJugador from "@/components/FilaJugador";
import FormNuevoJugadorManual from "@/components/FormNuevoJugadorManual";

export const dynamic = "force-dynamic";

export default async function PlantillaPage() {
  const session = await getServerSession(authOptions);
  const esAdmin = !!session?.user?.isAdmin;

  // dni/fechaNacimiento solo se piden (y por tanto solo llegan al HTML) si
  // quien mira la página es admin — para cualquier otro jugador ni siquiera
  // viajan en la respuesta, aunque la UI no los fuera a pintar.
  const jugadores = await prisma.user.findMany({
    orderBy: [{ dorsal: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      apodo: true,
      email: true,
      dorsal: true,
      posicion: true,
      estado: true,
      ...(esAdmin ? { dni: true, fechaNacimiento: true } : {}),
    },
  });

  const activos = jugadores.filter((j) => j.estado === "ACTIVO");
  const ayudas = jugadores.filter((j) => j.estado === "AYUDA");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl">Plantilla</h1>
          <p className="text-chalk/60 text-sm">{activos.length} activos · {ayudas.length} de ayuda</p>
        </div>
        {esAdmin && <FormNuevoJugadorManual />}
      </div>

      {jugadores.length === 0 && (
        <p className="text-chalk/50 text-sm">
          Todavía no ha entrado nadie con Google. Los jugadores aparecen aquí en cuanto se registran.
        </p>
      )}

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Activos</h2>
        {activos.length === 0 ? (
          <p className="text-chalk/50 text-sm">Todavía no hay jugadores activos.</p>
        ) : (
          <div className="space-y-2">
            {activos.map((j) => (
              <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-chalk/60 text-sm uppercase tracking-wide">Ayuda</h2>
        {ayudas.length === 0 ? (
          <p className="text-chalk/50 text-sm">No hay jugadores de ayuda apuntados.</p>
        ) : (
          <div className="space-y-2">
            {ayudas.map((j) => (
              <FilaJugador key={j.id} jugador={j} esAdmin={esAdmin} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
