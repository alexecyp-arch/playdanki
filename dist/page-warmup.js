(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=c9deac87f071","/theme.css?v=c9deac87f071","/analytics.js?v=c9deac87f071","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=bb045935234f","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=bb045935234f","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=bb045935234f","/data-atlas/","/data-atlas/?v=bb045935234f","/digit-span/","/digit-span/style.css?v=c9deac87f071","/digit-span/game.js?v=4d26ae4ed6fe","/","/notes-navigation.js?v=4d26ae4ed6fe","/account.js?v=4d26ae4ed6fe","/temponotes/autumn.js?v=4d26ae4ed6fe","/atlas-navigation.js?v=4d26ae4ed6fe","/weight-navigation.js?v=4d26ae4ed6fe","/timebox-navigation.js?v=4d26ae4ed6fe","/programming.html","/quant.html","/temponotes/","/temponotes/?v=4d26ae4ed6fe","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=336ee232f3f4","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=4d26ae4ed6fe","/timebox/","/timebox/?v=4d26ae4ed6fe","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=4d26ae4ed6fe","/weight-tracker/","/weight-tracker/?v=4d26ae4ed6fe","/weight-tracker/style.css?v=2c5b964e0776","/weight-tracker/bootstrap.js?v=4d26ae4ed6fe"];
  const key = 'danki:warm-pages:c703a5ba737b';
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
