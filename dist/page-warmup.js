(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=e3465ef7947e","/theme.css?v=e3465ef7947e","/analytics.js?v=e3465ef7947e","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=0959df335f74","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=0959df335f74","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=0959df335f74","/data-atlas/","/data-atlas/?v=0959df335f74","/digit-span/","/digit-span/style.css?v=e3465ef7947e","/digit-span/game.js?v=ebba773338b1","/","/notes-navigation.js?v=ebba773338b1","/account.js?v=ebba773338b1","/temponotes/autumn.js?v=ebba773338b1","/atlas-navigation.js?v=ebba773338b1","/weight-navigation.js?v=ebba773338b1","/timebox-navigation.js?v=ebba773338b1","/programming.html","/quant.html","/temponotes/","/temponotes/?v=ebba773338b1","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=472904ae2908","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=ebba773338b1","/timebox/","/timebox/?v=ebba773338b1","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=ebba773338b1","/weight-tracker/","/weight-tracker/?v=ebba773338b1","/weight-tracker/style.css?v=9f32b4c2b2e8","/weight-tracker/bootstrap.js?v=ebba773338b1"];
  const key = 'danki:warm-pages:f0d49597e2c0';
  try {
    if (sessionStorage.getItem(key)) return;
  } catch {}

  let index = 0;
  let scheduled = false;
  const idle = window.requestIdleCallback
    ? callback => window.requestIdleCallback(callback, {timeout: 2500})
    : callback => setTimeout(callback, 120);

  function schedule() {
    if (scheduled || document.hidden || index >= assets.length) return;
    scheduled = true;
    idle(async () => {
      if (document.hidden) {
        scheduled = false;
        return;
      }
      const path = assets[index++];
      if (path !== location.pathname + location.search) {
        try {
          const response = await fetch(path, {priority: 'low', signal: AbortSignal.timeout(6000)});
          if (response.ok) await response.arrayBuffer();
        } catch {}
      }
      scheduled = false;
      if (index === assets.length) {
        try { sessionStorage.setItem(key, '1'); } catch {}
      }
      schedule();
    });
  }

  const start = () => {
    document.addEventListener('visibilitychange', schedule);
    schedule();
  };
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, {once: true});
})();
