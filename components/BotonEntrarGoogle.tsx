"use client";

import { signIn } from "next-auth/react";

export default function BotonEntrarGoogle({ className }: { className?: string }) {
  return (
    <button
      onClick={() => signIn("google")}
      className={
        className ??
        "bg-malibu text-pitchdark font-medium px-4 py-2 rounded-md hover:bg-malibubright transition"
      }
    >
      Entrar con Google
    </button>
  );
}
