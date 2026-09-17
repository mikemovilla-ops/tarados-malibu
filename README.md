# Tarados Malibú

App para llevar el equipo de fútbol 7 Tarados Malibú: plantilla, calendario
(disponibilidad, convocatorias, goles y asistencias) y pagos (inscripción,
equipación, material).

- **👥 Plantilla**: cada jugador entra con su cuenta de Google y aparece
  aquí automáticamente (como "Ayuda" hasta que el admin lo mueva a
  "Activo"). El admin le asigna dorsal, posición y grupo, y también puede
  añadir jugadores a mano sin que tengan que loguearse. Cada jugador elige
  su propio apodo desde Ajustes, que es el nombre que ve el resto del
  equipo.
- **📅 Calendario**: el admin crea los partidos (fecha, rival, competición,
  local/visitante). Antes del partido, cada jugador responde si va, no va o
  duda, y en la lista de partidos se ve el resumen (de los activos). El
  admin gestiona la convocatoria oficial (activos y ayuda) y, después del
  partido, el resultado y los goles/asistencias de cada convocado.
- **📊 Estadísticas**: ranking de partidos jugados, goles y asistencias,
  calculado automáticamente a partir del calendario.
- **💳 Pagos**: tres secciones fijas — inscripción, equipación y material.
  El admin fija el importe de cada una y va marcando quién de los
  jugadores activos la tiene pagada. Cada jugador ve solo su propio
  estado.

Este documento asume que **no tienes ninguna cuenta creada todavía**. Sigue
los pasos en orden — en total son unos 20-30 minutos la primera vez (menos
si reaprovechas cuentas que ya tengas de otros proyectos, como Neon o
Vercel).

---

## 0. Lo que vas a necesitar

- Una cuenta de Google para ti y para cada jugador (para entrar en la app),
  y una cuenta de Google para crear el proyecto OAuth (puede ser la misma
  que la tuya)
- Una cuenta de GitHub (gratis) — es donde vivirá el código
- Una cuenta de Vercel (gratis) — es donde se aloja la web
- Un proyecto Postgres gratuito en **Neon**

---

## 1. Crear las credenciales de login con Google

1. Ve a [console.cloud.google.com](https://console.cloud.google.com) y crea
   un proyecto nuevo (arriba a la izquierda, "Seleccionar proyecto" →
   "Proyecto nuevo"). Ponle un nombre, por ejemplo "Tarados Malibú".
2. En el menú lateral, ve a **APIs y servicios → Pantalla de consentimiento
   OAuth**.
   - Tipo de usuario: **Externo**.
   - Rellena el nombre de la app, tu email de soporte y el email de
     contacto.
   - En "Usuarios de prueba" añade el email de Google de cada jugador (así
     no hace falta publicar la app ni pasar revisión de Google, al ser un
     grupo cerrado del equipo). Puedes volver más adelante a añadir más
     jugadores según se vayan uniendo.
3. Ve a **APIs y servicios → Credenciales → Crear credenciales → ID de
   cliente de OAuth**.
   - Tipo de aplicación: **Aplicación web**.
   - En "Orígenes autorizados de JavaScript" añade:
     `http://localhost:3000`
   - En "URI de redirección autorizados" añade:
     `http://localhost:3000/api/auth/callback/google`
   - Guarda el **Client ID** y el **Client Secret** — los necesitarás en el
     paso 4.
   - Más adelante, cuando tengas la URL real de Vercel, vuelve aquí y añade
     también `https://tu-dominio.vercel.app` y
     `https://tu-dominio.vercel.app/api/auth/callback/google`.

## 2. Subir el código a GitHub

1. Crea una cuenta en [github.com](https://github.com) si no tienes.
2. Crea un repositorio nuevo (botón verde "New"), por ejemplo
   `tarados-malibu`. Puede ser privado.
3. En tu ordenador, dentro de esta carpeta del proyecto, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Primera versión de Tarados Malibú"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/tarados-malibu.git
   git push -u origin main
   ```

## 3. Crear la base de datos (Neon)

1. Ve a [neon.tech](https://neon.tech) y crea una cuenta gratuita (puedes
   entrar directamente con tu cuenta de Google).
2. Crea un proyecto nuevo (distinto del de cualquier otra app que tengas).
   Cuando termine, verás una pantalla con la "Connection string" — cópiala,
   la necesitarás dos veces (como `DATABASE_URL` y como `DIRECT_URL`).

## 4. Configurar las variables de entorno en local

1. Copia el archivo `.env.example` como `.env`.
2. Rellena:
   - `DATABASE_URL` y `DIRECT_URL`: la connection string de Neon del paso 3.
   - `NEXTAUTH_SECRET`: genera uno ejecutando `openssl rand -base64 32` en
     tu terminal (o cualquier generador de cadenas aleatorias online).
   - `NEXTAUTH_URL`: déjalo como `http://localhost:3000` para pruebas
     locales.
   - `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`: los del paso 1.
   - `ADMIN_EMAILS`: tu email de Google (el admin del equipo). Si en el
     futuro quieres dar permisos de admin a alguien más, añade su email
     separado por coma.

## 5. Instalar y probar en local

```bash
npm install
npm run db:push   # crea las tablas en tu base de datos Neon
npm run dev
```

Abre `http://localhost:3000` y entra con tu cuenta de Google (la que
pusiste en `ADMIN_EMAILS`). Verás el panel de admin en Plantilla,
Calendario y Pagos.

## 6. Desplegar en Vercel

1. Ve a [vercel.com](https://vercel.com) y entra con tu cuenta de GitHub.
2. "Add New… → Project" y selecciona el repositorio `tarados-malibu`.
3. En "Environment Variables" añade las mismas variables que tienes en tu
   `.env`, pero con `NEXTAUTH_URL` apuntando a la URL que Vercel te va a
   dar (algo como `https://tarados-malibu.vercel.app`) — puedes desplegar
   una vez primero para saber la URL exacta, y luego editarla.
4. Dale a **Deploy**.
5. Cuando termine, vuelve a Google Cloud Console (paso 1) y añade la URL
   real de Vercel a los orígenes y a los URI de redirección autorizados.

¡Listo! Comparte la URL con el equipo para que cada jugador entre con su
cuenta de Google.

---

## Notas

- No hace falta "dar de alta" a un jugador a mano para que entre él mismo:
  en cuanto entra por primera vez con Google, aparece en Plantilla como
  "Ayuda". Desde ahí, el admin le asigna dorsal, posición y lo pasa a
  "Activo" si corresponde. El admin también puede añadir jugadores
  manualmente (sin cuenta de Google) para convocarlos y llevar sus
  estadísticas.
- Solo quien esté en `ADMIN_EMAILS` puede crear/editar partidos, gestionar
  convocatorias y resultados, editar la plantilla y gestionar pagos. El
  resto de jugadores tiene acceso de solo lectura a esas secciones, y
  gestiona su apodo y sus datos de contacto en Ajustes.
- Las estadísticas (goles, asistencias, partidos jugados) se calculan al
  vuelo a partir de las convocatorias — no hay que llevarlas a mano en
  ningún otro sitio.
