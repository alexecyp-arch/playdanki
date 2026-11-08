(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=bdf001d22c55","/theme.css?v=bdf001d22c55","/analytics.js?v=bdf001d22c55","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=311e925221ab","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=311e925221ab","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=311e925221ab","/data-atlas/","/data-atlas/?v=311e925221ab","/digit-span/","/digit-span/style.css?v=bdf001d22c55","/digit-span/game.js?v=9dbdb4068836","/","/notes-navigation.js?v=9dbdb4068836","/account.js?v=9dbdb4068836","/temponotes/autumn.js?v=9dbdb4068836","/atlas-navigation.js?v=9dbdb4068836","/weight-navigation.js?v=9dbdb4068836","/timebox-navigation.js?v=9dbdb4068836","/programming.html","/quant.html","/temponotes/","/temponotes/?v=9dbdb4068836","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=472904ae2908","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=9dbdb4068836","/timebox/","/timebox/?v=9dbdb4068836","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=9dbdb4068836","/weight-tracker/","/weight-tracker/?v=9dbdb4068836","/weight-tracker/style.css?v=4e7ffd9aea99","/weight-tracker/bootstrap.js?v=9dbdb4068836"];
  const key = 'danki:warm-pages:02e902cb4e80';
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
