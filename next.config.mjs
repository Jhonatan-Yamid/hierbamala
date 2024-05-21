/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/ingredient/:id',
        destination: '/api/ingredient/[id]', // Mapea las rutas dinámicas correctamente
      },
    ];
  },
};

export default nextConfig;
