// Registrar el Service Worker
export const registerServiceWorker = async () => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registrado:', registration);
      }
    } catch (error) {
      console.error('Error al registrar el Service Worker:', error);
    }
  };
  
  // Suscribirse al Push Manager
  export const subscribeUser = async (vapidPublicKey) => {
    try {
      const registration = await navigator.serviceWorker.ready;
  
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });
  
      // Envía la suscripción al backend
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
  
      console.log('Usuario suscrito:', subscription);
    } catch (error) {
      console.error('Error al suscribirse:', error);
    }
  };
  
  // Convertir clave VAPID a Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
  
    return outputArray;
  };
  