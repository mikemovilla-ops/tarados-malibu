/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  experimental: {
    // Por defecto, el App Router cachea en el navegador la última visita a
    // una página dinámica durante 30s y la reutiliza al volver a entrar por
    // un enlace en vez de pedir datos frescos al servidor — se nota como
    // "esto no se actualiza". Con 10s se sigue evitando quedarse con datos
    // desactualizados varios minutos, pero un par de clics seguidos entre
    // páginas no vuelven a pegarle a la base de datos cada vez.
    staleTimes: {
      dynamic: 10,
    },
  },
};

export default nextConfig;
