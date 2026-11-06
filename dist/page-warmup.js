(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=38f41e62dfce","/theme.css?v=38f41e62dfce","/analytics.js?v=38f41e62dfce","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=584a40354f42","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=584a40354f42","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=584a40354f42","/data-atlas/","/data-atlas/?v=584a40354f42","/digit-span/","/digit-span/style.css?v=38f41e62dfce","/digit-span/game.js?v=91069ac89cf2","/","/notes-navigation.js?v=91069ac89cf2","/account.js?v=91069ac89cf2","/temponotes/autumn.js?v=91069ac89cf2","/atlas-navigation.js?v=91069ac89cf2","/weight-navigation.js?v=91069ac89cf2","/timebox-navigation.js?v=91069ac89cf2","/programming.html","/quant.html","/temponotes/","/temponotes/?v=91069ac89cf2","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=e179141cba3f","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=91069ac89cf2","/timebox/","/timebox/?v=91069ac89cf2","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=91069ac89cf2","/weight-tracker/","/weight-tracker/?v=91069ac89cf2","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=91069ac89cf2"];
  const key = 'danki:warm-pages:486b65df6a4f';
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
