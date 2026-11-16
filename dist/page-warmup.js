(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=b34e8fcb587e","/theme.css?v=b34e8fcb587e","/analytics.js?v=b34e8fcb587e","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=588ef3b012c3","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=588ef3b012c3","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=588ef3b012c3","/data-atlas/","/data-atlas/?v=588ef3b012c3","/digit-span/","/digit-span/style.css?v=b34e8fcb587e","/digit-span/game.js?v=12d217ac7354","/","/notes-navigation.js?v=12d217ac7354","/account.js?v=12d217ac7354","/temponotes/autumn.js?v=12d217ac7354","/atlas-navigation.js?v=12d217ac7354","/weight-navigation.js?v=12d217ac7354","/programming.html","/quant.html","/temponotes/","/temponotes/?v=12d217ac7354","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=2c9b67b0c8c5","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=12d217ac7354","/timebox/","/timebox/?v=12d217ac7354","/weight-tracker/","/weight-tracker/?v=12d217ac7354","/weight-tracker/style.css?v=9b1f01ba93b8","/weight-tracker/bootstrap.js?v=12d217ac7354"];
  const key = 'danki:warm-pages:c88d73886e72';
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
