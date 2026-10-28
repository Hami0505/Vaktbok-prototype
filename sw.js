// Fjerner den gamle versjonen av Vaktbok som ble lagret på den gamle adressen,
// slik at besøkende kommer til den nye i stedet for en gammel kopi.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) await caches.delete(key);
    await self.registration.unregister();
    for (const client of await self.clients.matchAll({ type: 'window' })) client.navigate(client.url);
  })());
});
