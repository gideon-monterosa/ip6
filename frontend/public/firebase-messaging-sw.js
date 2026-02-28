importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const clickUrl = payload.fcmOptions?.link ||
                   payload.data?.click_url ||
                   (payload.data?.eventId ? `/feedback/${payload.data.eventId}` : '/feedback');

  const notificationTitle = payload.notification?.title || 'Meeting feedback';
  const notificationOptions = {
    body: payload.notification?.body || 'Please provide feedback for this meeting.',
    icon: '/favicon.ico',
    data: {
      click_url: clickUrl
    }
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received', event);
  event.notification.close();

  let clickUrl = event.notification.data?.click_url;

  if (!clickUrl) {
    clickUrl = '/feedback';
  }

  if (clickUrl.startsWith('/')) {
    clickUrl = self.location.origin + clickUrl;
  }

  console.log('[firebase-messaging-sw.js] Opening URL:', clickUrl);

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === clickUrl && 'focus' in client) {
          return client.focus();
        }
      }

      if (windowClients.length > 0) {
        const client = windowClients[0];
        if ('navigate' in client) {
          return client.navigate(clickUrl).then(c => c?.focus());
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(clickUrl);
      }
    })
  );
});
