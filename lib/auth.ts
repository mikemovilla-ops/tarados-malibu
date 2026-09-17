import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

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
      }
      return session;
    },
  },
};
