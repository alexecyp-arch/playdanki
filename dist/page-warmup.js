(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=76a32c436fe8","/theme.css?v=76a32c436fe8","/analytics.js?v=76a32c436fe8","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=b66838e7e9ed","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=b66838e7e9ed","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=b66838e7e9ed","/data-atlas/","/data-atlas/?v=b66838e7e9ed","/digit-span/","/digit-span/style.css?v=76a32c436fe8","/digit-span/game.js?v=8d52d9c201d8","/","/notes-navigation.js?v=8d52d9c201d8","/account.js?v=8d52d9c201d8","/temponotes/autumn.js?v=8d52d9c201d8","/atlas-navigation.js?v=8d52d9c201d8","/weight-navigation.js?v=8d52d9c201d8","/programming.html","/quant.html","/temponotes/","/temponotes/?v=8d52d9c201d8","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=2c9b67b0c8c5","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=8d52d9c201d8","/timebox/","/timebox/?v=8d52d9c201d8","/weight-tracker/","/weight-tracker/?v=8d52d9c201d8","/weight-tracker/style.css?v=9b1f01ba93b8","/weight-tracker/bootstrap.js?v=8d52d9c201d8"];
  const key = 'danki:warm-pages:c1e7ad689ee9';
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
