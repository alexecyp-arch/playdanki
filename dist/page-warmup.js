(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=5e2e20cb68fe","/theme.css?v=5e2e20cb68fe","/analytics.js?v=5e2e20cb68fe","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=44b04e5c3861","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=44b04e5c3861","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=44b04e5c3861","/data-atlas/","/data-atlas/?v=44b04e5c3861","/digit-span/","/digit-span/style.css?v=5e2e20cb68fe","/digit-span/game.js?v=16d00590074e","/","/notes-navigation.js?v=16d00590074e","/account.js?v=16d00590074e","/temponotes/autumn.js?v=16d00590074e","/atlas-navigation.js?v=16d00590074e","/weight-navigation.js?v=16d00590074e","/programming.html","/quant.html","/temponotes/","/temponotes/?v=16d00590074e","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=7ca49648c62a","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=16d00590074e","/timebox/","/timebox/?v=16d00590074e","/weight-tracker/","/weight-tracker/?v=16d00590074e","/weight-tracker/style.css?v=bc5075b8dc23","/weight-tracker/bootstrap.js?v=16d00590074e"];
  const key = 'danki:warm-pages:49f1c7e98f2c';
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
