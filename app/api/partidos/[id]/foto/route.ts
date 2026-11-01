import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { authOptions } from "@/lib/auth";

// Genera el token que el navegador usa para subir la foto directamente a
// Vercel Blob (sin pasar por nuestro servidor, que tiene un límite de
// tamaño de petición mucho más bajo que una foto de móvil). Solo el admin
// puede pedir ese token; la subida en sí la hace el componente cliente con
// @vercel/blob/client (ver SubirFotoPartido.tsx), que luego guarda la URL
// resultante con un PATCH normal a /api/partidos/[id].
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }

  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/heic"],
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => {
        // No hace falta hacer nada aquí: el cliente guarda la URL con un
        // PATCH a /api/partidos/[id] en cuanto `upload()` resuelve, sin
        // depender de este callback (que en local no es alcanzable).
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
