(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=42757cbf0215","/theme.css?v=42757cbf0215","/analytics.js?v=42757cbf0215","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=e2feddcd240f","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=e2feddcd240f","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=e2feddcd240f","/data-atlas/","/data-atlas/?v=e2feddcd240f","/digit-span/","/digit-span/style.css?v=42757cbf0215","/digit-span/game.js?v=501bab3d93aa","/","/notes-navigation.js?v=501bab3d93aa","/account.js?v=501bab3d93aa","/temponotes/autumn.js?v=501bab3d93aa","/atlas-navigation.js?v=501bab3d93aa","/weight-navigation.js?v=501bab3d93aa","/programming.html","/quant.html","/temponotes/","/temponotes/?v=501bab3d93aa","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=2c9b67b0c8c5","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=501bab3d93aa","/timebox/","/timebox/?v=501bab3d93aa","/weight-tracker/","/weight-tracker/?v=501bab3d93aa","/weight-tracker/style.css?v=9b1f01ba93b8","/weight-tracker/bootstrap.js?v=501bab3d93aa"];
  const key = 'danki:warm-pages:c46e234a9a84';
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
