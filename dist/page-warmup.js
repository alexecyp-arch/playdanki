(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=cfee3065be4a","/theme.css?v=cfee3065be4a","/analytics.js?v=cfee3065be4a","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=3d45e316f6af","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=3d45e316f6af","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=3d45e316f6af","/data-atlas/","/data-atlas/?v=3d45e316f6af","/digit-span/","/digit-span/style.css?v=cfee3065be4a","/digit-span/game.js?v=8fd19e401cf0","/","/notes-navigation.js?v=8fd19e401cf0","/account.js?v=8fd19e401cf0","/temponotes/autumn.js?v=8fd19e401cf0","/atlas-navigation.js?v=8fd19e401cf0","/weight-navigation.js?v=8fd19e401cf0","/programming.html","/quant.html","/temponotes/","/temponotes/?v=8fd19e401cf0","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=7ca49648c62a","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=8fd19e401cf0","/timebox/","/timebox/?v=8fd19e401cf0","/weight-tracker/","/weight-tracker/?v=8fd19e401cf0","/weight-tracker/style.css?v=9b1f01ba93b8","/weight-tracker/bootstrap.js?v=8fd19e401cf0"];
  const key = 'danki:warm-pages:79540603bb37';
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
