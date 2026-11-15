(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=5e2e20cb68fe","/theme.css?v=5e2e20cb68fe","/analytics.js?v=5e2e20cb68fe","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=44b04e5c3861","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=44b04e5c3861","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=44b04e5c3861","/data-atlas/","/data-atlas/?v=44b04e5c3861","/digit-span/","/digit-span/style.css?v=5e2e20cb68fe","/digit-span/game.js?v=dcdc48e78d8b","/","/notes-navigation.js?v=dcdc48e78d8b","/account.js?v=dcdc48e78d8b","/temponotes/autumn.js?v=dcdc48e78d8b","/atlas-navigation.js?v=dcdc48e78d8b","/weight-navigation.js?v=dcdc48e78d8b","/programming.html","/quant.html","/temponotes/","/temponotes/?v=dcdc48e78d8b","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=7ca49648c62a","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=dcdc48e78d8b","/timebox/","/timebox/?v=dcdc48e78d8b","/weight-tracker/","/weight-tracker/?v=dcdc48e78d8b","/weight-tracker/style.css?v=71c75e67ff8d","/weight-tracker/bootstrap.js?v=dcdc48e78d8b"];
  const key = 'danki:warm-pages:d4148446bfff';
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
