import Link from "next/link";
import BotonEntrarGoogle from "@/components/BotonEntrarGoogle";

// Pantalla que ve quien no puede ni leer el foro: sin sesión, o un "no
// jugador" sin cuota de socio pagada — a ojos del foro, se tratan igual.
export default function ForoAcceso({ logueado }: { logueado: boolean }) {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 text-center space-y-3">
      <h1 className="font-display text-2xl">Foro</h1>
      {logueado ? (
        <p className="text-chalk/60">
          Para ver el foro hace falta estar al día con la cuota de socio — puedes conocerla en{" "}
          <Link href="/pagos" className="underline">
            Pagos
          </Link>
          . Consulta con alguien del equipo para más información.
        </p>
      ) : (
        <>
          <p className="text-chalk/60">Entra con Google para ver y participar en el foro.</p>
          <BotonEntrarGoogle className="bg-amarillo text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-amarillobrillante transition inline-block" />
        </>
      )}
    </div>
  );
}
