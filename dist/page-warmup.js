(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=e33fe8c790be","/theme.css?v=e33fe8c790be","/analytics.js?v=e33fe8c790be","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=62a4132ec05f","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=62a4132ec05f","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=62a4132ec05f","/data-atlas/","/data-atlas/?v=62a4132ec05f","/digit-span/","/digit-span/style.css?v=e33fe8c790be","/digit-span/game.js?v=bc69e35029ab","/","/notes-navigation.js?v=bc69e35029ab","/account.js?v=bc69e35029ab","/temponotes/autumn.js?v=bc69e35029ab","/atlas-navigation.js?v=bc69e35029ab","/weight-navigation.js?v=bc69e35029ab","/timebox-navigation.js?v=bc69e35029ab","/programming.html","/quant.html","/temponotes/","/temponotes/?v=bc69e35029ab","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=336ee232f3f4","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=bc69e35029ab","/timebox/","/timebox/?v=bc69e35029ab","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=bc69e35029ab","/weight-tracker/","/weight-tracker/?v=bc69e35029ab","/weight-tracker/style.css?v=2c5b964e0776","/weight-tracker/bootstrap.js?v=bc69e35029ab"];
  const key = 'danki:warm-pages:4c7f329c3572';
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
