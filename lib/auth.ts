import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import { enviarAvisoUsuarioNuevo } from "@/lib/email";

// Los emails listados aquí (separados por comas en la env ADMIN_EMAILS) son
// quienes pueden gestionar la plantilla, el calendario y los pagos. El resto
// de jugadores solo pueden ver su propio calendario, estadísticas y cuotas.
export const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: "database" },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id;
        (session.user as any).isAdmin = ADMIN_EMAILS.includes(
          (user.email ?? "").toLowerCase()
        );
        // Para poder mandar a un usuario recién creado directo a /ajustes
        // (ver components/RedireccionPrimerLogin.tsx) sin necesitar un
        // campo nuevo en la BD: se considera "nuevo" si la cuenta se creó
        // hace unos segundos, más que de sobra para el hueco entre que el
        // adapter crea el usuario y se lee esta sesión justo después.
        (session.user as any).esNuevo =
          Date.now() - new Date((user as any).createdAt).getTime() < 10_000;
      }
      return session;
    },
  },
  events: {
    // Avisa a los admins (por email, no bloqueante) cada vez que alguien
    // entra por primera vez con Google, para que sepan que hay que
    // revisarlo en /plantilla (entra como "Ayuda" por defecto).
    async createUser({ user }) {
      const usuarios = await prisma.user.findMany({
        select: { email: true, emailNotificaciones: true },
      });
      const destinatarios = usuarios
        .filter((u) => ADMIN_EMAILS.includes((u.email ?? "").toLowerCase()))
        .map((u) => u.emailNotificaciones ?? u.email)
        .filter((e): e is string => !!e);
      await enviarAvisoUsuarioNuevo(destinatarios, { name: user.name ?? null, email: user.email ?? null });
    },
  },
};
