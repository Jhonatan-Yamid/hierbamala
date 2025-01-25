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
  async headers() {
    return [
      {
        source: '/api/(.*)', // Aplica a todas las rutas de API
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
};

export default nextConfig;
