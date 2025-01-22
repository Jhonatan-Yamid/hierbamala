self.addEventListener('push', (event) => {
    const data = event.data.json();
  
    const title = data.title;
    const options = {
      body: data.body,
      icon: '/icon-192x192.png', // Asegúrate de tener este ícono en /public
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  
  self.addEventListener('notificationclick', (event) => {
    event.notification.close();
  
    // Abrir una URL específica al hacer clic en la notificación
    event.waitUntil(clients.openWindow('/dashboard/IngredientInventory'));
  });
  