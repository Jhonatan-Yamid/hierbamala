import webPush from 'web-push';

// Configuración de VAPID
webPush.setVapidDetails(
  'mailto:yamidjhonatan@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default webPush;
