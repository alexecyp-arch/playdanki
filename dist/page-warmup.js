(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=4fd65ed5e9b0","/theme.css?v=4fd65ed5e9b0","/analytics.js?v=4fd65ed5e9b0","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=41e7a503d35c","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=41e7a503d35c","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=41e7a503d35c","/data-atlas/","/data-atlas/?v=41e7a503d35c","/digit-span/","/digit-span/style.css?v=4fd65ed5e9b0","/digit-span/game.js?v=ee57e2dc5f2a","/","/notes-navigation.js?v=ee57e2dc5f2a","/account.js?v=ee57e2dc5f2a","/temponotes/autumn.js?v=ee57e2dc5f2a","/atlas-navigation.js?v=ee57e2dc5f2a","/weight-navigation.js?v=ee57e2dc5f2a","/timebox-navigation.js?v=ee57e2dc5f2a","/programming.html","/quant.html","/temponotes/","/temponotes/?v=ee57e2dc5f2a","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=7ca49648c62a","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=ee57e2dc5f2a","/timebox/","/timebox/?v=ee57e2dc5f2a","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=ee57e2dc5f2a","/weight-tracker/","/weight-tracker/?v=ee57e2dc5f2a","/weight-tracker/style.css?v=4dc78c0fd39b","/weight-tracker/bootstrap.js?v=ee57e2dc5f2a"];
  const key = 'danki:warm-pages:0c07e1b20b14';
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
