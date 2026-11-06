(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=0fa15b982b5e","/theme.css?v=0fa15b982b5e","/analytics.js?v=0fa15b982b5e","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=50b3b01e8002","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=50b3b01e8002","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=50b3b01e8002","/data-atlas/","/data-atlas/?v=50b3b01e8002","/digit-span/","/digit-span/style.css?v=0fa15b982b5e","/digit-span/game.js?v=928ec638e20b","/","/notes-navigation.js?v=928ec638e20b","/account.js?v=928ec638e20b","/temponotes/autumn.js?v=928ec638e20b","/atlas-navigation.js?v=928ec638e20b","/weight-navigation.js?v=928ec638e20b","/timebox-navigation.js?v=928ec638e20b","/programming.html","/quant.html","/temponotes/","/temponotes/?v=928ec638e20b","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=e179141cba3f","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=928ec638e20b","/timebox/","/timebox/?v=928ec638e20b","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=928ec638e20b","/weight-tracker/","/weight-tracker/?v=928ec638e20b","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=928ec638e20b"];
  const key = 'danki:warm-pages:a88c25a73792';
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
