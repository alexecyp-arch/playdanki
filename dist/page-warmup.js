(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=65d8ab48c4b9","/theme.css?v=65d8ab48c4b9","/analytics.js?v=65d8ab48c4b9","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=311e925221ab","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=311e925221ab","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=311e925221ab","/data-atlas/","/data-atlas/?v=311e925221ab","/digit-span/","/digit-span/style.css?v=65d8ab48c4b9","/digit-span/game.js?v=ecdfc0ef30fa","/","/notes-navigation.js?v=ecdfc0ef30fa","/account.js?v=ecdfc0ef30fa","/temponotes/autumn.js?v=ecdfc0ef30fa","/atlas-navigation.js?v=ecdfc0ef30fa","/weight-navigation.js?v=ecdfc0ef30fa","/timebox-navigation.js?v=ecdfc0ef30fa","/programming.html","/quant.html","/temponotes/","/temponotes/?v=ecdfc0ef30fa","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=472904ae2908","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=ecdfc0ef30fa","/timebox/","/timebox/?v=ecdfc0ef30fa","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=ecdfc0ef30fa","/weight-tracker/","/weight-tracker/?v=ecdfc0ef30fa","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=ecdfc0ef30fa"];
  const key = 'danki:warm-pages:679252842f77';
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
