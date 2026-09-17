import type { Metadata } from "next";
import { Oswald, Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import VersionPopup from "@/components/VersionPopup";

const display = Oswald({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Tarados Malibú",
  description: "Plantilla, calendario y pagos del Tarados Malibú (fútbol 7)",
  icons: { icon: "/favicon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${display.variable} ${body.variable} font-body bg-pitch text-chalk flex min-h-screen flex-col pitch-pattern`}
      >
        <Providers>
          <Navbar />
          {/* flex-1 en vez de min-h-screen: así el footer queda pegado
              abajo del todo cuando el contenido es corto, y sigue
              apareciendo justo después del contenido cuando la página ya es
              más larga que la pantalla. El hueco para que la barra de
              navegación fija de abajo (BottomNav) no tape nada en móvil lo
              pone el propio Footer, que es lo último de la página. */}
          <main className="flex-1">{children}</main>
          <Footer />
          <VersionPopup />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
