export default function Footer() {
  return (
    // pb-24 en móvil (en vez de pb-6): sitio de sobra para que la barra de
    // navegación flotante de abajo (BottomNav) no tape este footer, que es
    // literalmente lo último de la página.
    <footer className="border-t border-chalk/10 pt-6 pb-24 md:pb-6 text-center">
      <p className="text-chalk/40 text-xs">⚽ Tarados Malibú — fútbol 7</p>
    </footer>
  );
}
