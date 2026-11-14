// Ya no es interactivo: antes dejaba a cualquiera autoasignarse Jugador o
// No jugador ("¿Eres jugador?"), pero eso permitía que alguien de fuera del
// equipo (p.ej. llegado por el enlace publicado en la web de la liga) se
// autoasignara Jugador con un clic. Ahora solo el admin clasifica a cada
// nuevo usuario desde Plantilla; esto es solo el aviso mientras tanto.
export default function PendienteClasificar() {
  return (
    <section className="card p-5 space-y-2 border-amarillo/40">
      <h2 className="font-display text-base">Pendiente de clasificar</h2>
      <p className="text-chalk/60 text-sm">
        Un admin del equipo todavía tiene que darte de alta como jugador o socio. Mientras tanto puedes ver la home,
        la plantilla y el calendario, pero no entrar en el detalle de cada partido ni en las fichas de los
        jugadores.
      </p>
    </section>
  );
}
