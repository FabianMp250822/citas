/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de webpack para importar archivos SVG
  webpack(config) {
    // Buscamos la regla existente que maneja las importaciones de SVG
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.(".svg")
    );

    // Agregamos dos reglas:
    // 1. Para *.svg?url, se reutiliza la regla existente.
    // 2. Para los demás archivos SVG, se usan como componentes React a través de @svgr/webpack.
    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // Ejemplo: import icon from './icon.svg?url'
      },
      {
        test: /\.svg$/i,
        issuer: fileLoaderRule.issuer,
        resourceQuery: { not: [...(fileLoaderRule.resourceQuery?.not || []), /url/] }, // Excluir si lleva ?url
        use: ["@svgr/webpack"],
      }
    );

    // Modificamos la regla original para que ignore los archivos SVG
    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },

  // Configuración de imágenes, combinando domains, formatos y remotePatterns
  images: {
    // Para Next.js < 13 puedes usar 'domains' y 'formats'
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],

    // Para Next.js 13 en adelante, se recomienda remotePatterns:
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.lorem.space",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "a0.muscache.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  // Otras configuraciones experimentales si las necesitas
  experimental: {
    // Por ejemplo, optimizaciones adicionales
  },
};

module.exports = nextConfig;
