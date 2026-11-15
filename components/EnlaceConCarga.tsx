"use client";

import Link from "next/link";
import { useTransition, type ReactNode, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

// Un <Link> normal no da ninguna pista mientras tarda en cargar la página
// siguiente — en móvil eso invita a tocar otra vez pensando que no ha
// funcionado (ver el mismo problema ya resuelto para Navbar/BottomNav).
// Esto intercepta el toque y atenúa justo ese enlace — no una barra global
// arriba, que en móvil pasa desapercibida — hasta que la navegación
// termina, e ignora toques repetidos mientras tanto.
export default function EnlaceConCarga({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [navegando, startTransition] = useTransition();

  function onClick(e: MouseEvent) {
    e.preventDefault();
    if (navegando) return;
    startTransition(() => router.push(href));
  }

  return (
    <Link href={href} onClick={onClick} className={`${className} transition-opacity ${navegando ? "opacity-50" : ""}`}>
      {children}
    </Link>
  );
}
