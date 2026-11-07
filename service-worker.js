const CACHE_NAME = 'tju-thermohub-v13.3.0-eos-lkp-vle-if97';
const CORE_ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './assets/css/theme.css',
  './assets/js/eos/eos.js', './assets/js/eos/lee-kesler.js', './assets/js/eos/vle.js',
  './assets/js/steam/region4.js', './assets/js/steam/if97.js',
  './assets/vendor/if97/NeutriumJS.thermo.IAPWS97.js',
  './assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PT.js',
  './assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PH.js',
  './assets/vendor/if97/NeutriumJS.thermo.IAPWS97.PS.js',
  './assets/vendor/if97/NeutriumJS.thermo.IAPWS97.HS.js',
  './assets/js/charts/draw.js', './assets/js/derive/derivations.js', './assets/js/core/app.js',
  './data/chemicals/chemicals.json', './data/glossary/glossary.json', './data/constants/constants.json', './data/sources/sources.json'
];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => { const req=event.request; if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return; event.respondWith((async()=>{const cache=await caches.open(CACHE_NAME);try{const fresh=await fetch(req);if(fresh&&fresh.ok)cache.put(req,fresh.clone());return fresh;}catch(err){const cached=await cache.match(req);if(cached)return cached;if(req.mode==='navigate')return cache.match('./index.html');throw err;}})()); });