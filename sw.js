// Changez ce numéro à chaque mise en ligne pour forcer la mise à jour du cache.
const CACHE='aplc-v5.2';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon-180.png','./icon-192.png','./icon-512.png'];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

// Supprime les anciens caches (dont aplc-v1)
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys()
    .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim()));
});

self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET'||new URL(req.url).origin!==location.origin)return;
  // Page : réseau d'abord (les mises à jour arrivent), cache si hors ligne
  if(req.mode==='navigate'||req.destination==='document'){
    e.respondWith(fetch(req).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return res;
    }).catch(()=>caches.match('./index.html')));
    return;
  }
  // Icônes, manifeste : cache d'abord
  e.respondWith(caches.match(req).then(r=>r||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(req,copy))}return res;
  })));
});
