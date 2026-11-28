"use client";

// Solo para el admin: prepara un mensaje con el enlace al partido y quién
// falta por responder, y abre WhatsApp (la app en móvil, WhatsApp Web en
// escritorio) con el texto ya escrito — WhatsApp no deja elegir el grupo
// desde un enlace, así que quien lo envía elige el chat del equipo a mano.
export default function CompartirWhatsapp({
  partidoId,
  rival,
  esLocal,
  fechaTexto,
  pendientes,
}: {
  partidoId: string;
  rival: string;
  esLocal: boolean;
  fechaTexto: string;
  pendientes: string[];
}) {
  function compartir() {
    const enlace = `${window.location.origin}/calendario/${partidoId}`;
    const contra = esLocal ? `vs ${rival}` : `@ ${rival}`;
    const lineas = [
      `⚽ ${contra} — ${fechaTexto}`,
      pendientes.length > 0
        ? `Todavía no han dicho si van: ${pendientes.join(", ")}`
        : "Ya ha respondido todo el mundo.",
      enlace,
    ];
    const texto = encodeURIComponent(lineas.join("\n\n"));
    // Con la web añadida a la pantalla de inicio (modo standalone, el
    // icono propio del iPhone), un enlace https://wa.me/ abre WhatsApp
    // pero sin el texto — el salto de "enlace universal" no lleva la
    // query string cuando no viene de Safari. El esquema whatsapp:// sí
    // lo lleva bien ahí; fuera de standalone (navegador normal, o
    // escritorio sin la app) se usa wa.me, que redirige también a
    // WhatsApp Web si no hay app instalada.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true;
    window.location.href = standalone ? `whatsapp://send?text=${texto}` : `https://wa.me/?text=${texto}`;
  }

  return (
    <button
      onClick={compartir}
      className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md bg-[#25D366] text-[#05291b] hover:bg-[#1fb959] transition"
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.15.347-.398.52-.597.174-.198.232-.347.349-.57.117-.198.019-.371-.059-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.009-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.057 3.146 5.003 4.286 2.946 1.14 2.946.76 3.477.711.53-.05 1.758-.72 2.006-1.414.248-.694.248-1.288.173-1.414-.074-.124-.272-.198-.569-.347z" />
        <path d="M12.004 2C6.486 2 2 6.486 2 12.004c0 1.98.57 3.828 1.555 5.396L2.057 22l4.728-1.474a9.957 9.957 0 0 0 5.219 1.448c5.519 0 10.004-4.486 10.004-10.005C22.008 6.486 17.523 2 12.004 2zm0 18.198a8.17 8.17 0 0 1-4.422-1.3l-.317-.199-3.11.97.986-3.03-.206-.312a8.19 8.19 0 0 1-1.287-4.433c0-4.522 3.68-8.198 8.356-8.198 4.522 0 8.198 3.676 8.198 8.198 0 4.523-3.676 8.304-8.198 8.304z" />
      </svg>
      Preparar mensaje
    </button>
  );
}
