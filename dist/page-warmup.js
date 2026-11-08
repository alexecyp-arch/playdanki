(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=bdf001d22c55","/theme.css?v=bdf001d22c55","/analytics.js?v=bdf001d22c55","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=311e925221ab","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=311e925221ab","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=311e925221ab","/data-atlas/","/data-atlas/?v=311e925221ab","/digit-span/","/digit-span/style.css?v=bdf001d22c55","/digit-span/game.js?v=4955ff60f7e9","/","/notes-navigation.js?v=4955ff60f7e9","/account.js?v=4955ff60f7e9","/temponotes/autumn.js?v=4955ff60f7e9","/atlas-navigation.js?v=4955ff60f7e9","/weight-navigation.js?v=4955ff60f7e9","/timebox-navigation.js?v=4955ff60f7e9","/programming.html","/quant.html","/temponotes/","/temponotes/?v=4955ff60f7e9","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=472904ae2908","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=4955ff60f7e9","/timebox/","/timebox/?v=4955ff60f7e9","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=4955ff60f7e9","/weight-tracker/","/weight-tracker/?v=4955ff60f7e9","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=4955ff60f7e9"];
  const key = 'danki:warm-pages:62a3aa92edb6';
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
