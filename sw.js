const CACHE='ieneko-shell-v2.24';
const SHELL=['./','./index.html','./app.css?v=2.24','./appearance.css?v=2.24&r=4','./card-social.css?v=2.24','./dist/ieneko-app-icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('ieneko-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){event.respondWith(fetch(event.request).catch(()=>caches.match('./index.html')));return;}
  event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request)));
});
