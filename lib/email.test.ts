import { describe, expect, it } from "vitest";
import { escapeHtml, enviarAvisoUsuarioNuevo, enviarAvisoNuevoPartido } from "@/lib/email";

describe("escapeHtml", () => {
  it("escapa las entidades HTML básicas", () => {
    expect(escapeHtml(`<script>alert("hi") & 'bye'</script>`)).toBe(
      "&lt;script&gt;alert(&quot;hi&quot;) &amp; &#39;bye&#39;&lt;/script&gt;"
    );
  });

  it("deja intacto el texto sin caracteres especiales", () => {
    expect(escapeHtml("Miguel Valdunquillo")).toBe("Miguel Valdunquillo");
  });
});

// En el entorno de test no hay GMAIL_USER/GMAIL_APP_PASSWORD (vitest no
// carga .env), así que el transporter interno es null y estas funciones
// deben resolver sin lanzar nada — es justo lo que las hace seguras de
// llamar siempre, tenga o no configurado el envío real.
describe("envío de avisos sin credenciales configuradas", () => {
  it("enviarAvisoUsuarioNuevo no lanza sin transporter", async () => {
    await expect(
      enviarAvisoUsuarioNuevo(["admin@example.com"], { name: "Jugador", email: "jugador@example.com" })
    ).resolves.toBeUndefined();
  });

  it("enviarAvisoNuevoPartido no lanza sin transporter", async () => {
    await expect(
      enviarAvisoNuevoPartido(["admin@example.com"], {
        id: "partido1",
        rival: "CD Rival",
        esLocal: true,
        fecha: new Date(2026, 9, 1, 18, 0),
        competicion: "Liga",
        jornada: 3,
        lugar: null,
      })
    ).resolves.toBeUndefined();
  });

  it("no hace nada con una lista de destinatarios vacía", async () => {
    await expect(enviarAvisoUsuarioNuevo([], { name: null, email: null })).resolves.toBeUndefined();
  });
});
