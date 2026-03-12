const CACHE_NAME = 'clt-rico-v3.6-final'; 
const STATIC_ASSETS = [ 
  '/', 
  '/manifest.json', 
  '/icon-192.png', 
  '/icon-512.png', 
]; 

// Force SW Update 2026-03-12-MobileFix
// Install: cacheia os assets estáticos 
self.addEventListener('install', (event) => {  
  event.waitUntil( 
    caches.open(CACHE_NAME).then((cache) => { 
      return cache.addAll(STATIC_ASSETS); 
    }) 
  ); 
  self.skipWaiting(); 
}); 

// Activate: limpa caches antigos 
self.addEventListener('activate', (event) => { 
  event.waitUntil( 
    caches.keys().then((keys) => 
      Promise.all( 
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)) 
      ) 
    ) 
  ); 
  self.clients.claim(); 
}); 

// Fetch: Network first, fallback para cache 
self.addEventListener('fetch', (event) => { 
  // Ignora requests não-GET e extensões do browser 
  if (event.request.method !== 'GET') return; 
  if (event.request.url.startsWith('chrome-extension')) return; 
  // Ignora Supabase requests (auth, db, etc) para evitar problemas de cache
  if (event.request.url.includes('supabase.co')) return; 

  event.respondWith( 
    fetch(event.request) 
      .then((response) => { 
        // Se a resposta for válida, clona e salva no cache 
        if (response && response.status === 200 && response.type === 'basic') { 
          const responseClone = response.clone(); 
          caches.open(CACHE_NAME).then((cache) => { 
            cache.put(event.request, responseClone); 
          }); 
        } 
        return response; 
      }) 
      .catch(() => { 
        // Offline: tenta buscar no cache 
        return caches.match(event.request).then((cached) => { 
          if (cached) return cached; 
          // Fallback para a home se for navegação de página
          if (event.request.mode === 'navigate') { 
            return caches.match('/'); 
          } 
        }); 
      }) 
  ); 
});/* force cache v3 */
/* force cache v3 */
