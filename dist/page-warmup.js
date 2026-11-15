(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=5e2e20cb68fe","/theme.css?v=5e2e20cb68fe","/analytics.js?v=5e2e20cb68fe","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=44b04e5c3861","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=44b04e5c3861","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=44b04e5c3861","/data-atlas/","/data-atlas/?v=44b04e5c3861","/digit-span/","/digit-span/style.css?v=5e2e20cb68fe","/digit-span/game.js?v=7aa39d6716a5","/","/notes-navigation.js?v=7aa39d6716a5","/account.js?v=7aa39d6716a5","/temponotes/autumn.js?v=7aa39d6716a5","/atlas-navigation.js?v=7aa39d6716a5","/weight-navigation.js?v=7aa39d6716a5","/programming.html","/quant.html","/temponotes/","/temponotes/?v=7aa39d6716a5","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=7ca49648c62a","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=7aa39d6716a5","/timebox/","/timebox/?v=7aa39d6716a5","/weight-tracker/","/weight-tracker/?v=7aa39d6716a5","/weight-tracker/style.css?v=ab46bdee2782","/weight-tracker/bootstrap.js?v=7aa39d6716a5"];
  const key = 'danki:warm-pages:133a17088277';
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
