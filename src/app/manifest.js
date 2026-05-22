export default function manifest() {
  return {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Hierbamala',
    short_name: process.env.NEXT_PUBLIC_APP_SHORT_NAME || 'Hierbamala',
    description: 'Para compartir y disfrutar en familia y amigos. Ofrecemos Entradas , Asados , comida mexicana, Antojos dulces, Cócteles de autor, Shots',
    start_url: '/dashboard',
    scope: '/dashboard',
    display: 'standalone',
    theme_color: '#020712',
    background_color: '#020712',
    icons: [
      {
        src: process.env.NEXT_PUBLIC_MANIFEST_ICON_192 || '/icons/default-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: process.env.NEXT_PUBLIC_MANIFEST_ICON_256 || '/icons/default-256.png',
        sizes: '256x256',
        type: 'image/png',
      },
      {
        src: process.env.NEXT_PUBLIC_MANIFEST_ICON_512 || '/icons/default-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}