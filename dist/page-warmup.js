(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=13306f78dd86","/theme.css?v=13306f78dd86","/analytics.js?v=13306f78dd86","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=e2b4b8198682","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=e2b4b8198682","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=e2b4b8198682","/data-atlas/","/data-atlas/?v=e2b4b8198682","/digit-span/","/digit-span/style.css?v=13306f78dd86","/digit-span/game.js?v=6b0d81e61f10","/","/notes-navigation.js?v=6b0d81e61f10","/account.js?v=6b0d81e61f10","/temponotes/autumn.js?v=6b0d81e61f10","/atlas-navigation.js?v=6b0d81e61f10","/weight-navigation.js?v=6b0d81e61f10","/timebox-navigation.js?v=6b0d81e61f10","/programming.html","/quant.html","/temponotes/","/temponotes/?v=6b0d81e61f10","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=377ac5182b76","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=6b0d81e61f10","/timebox/","/timebox/?v=6b0d81e61f10","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=6b0d81e61f10","/weight-tracker/","/weight-tracker/?v=6b0d81e61f10","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=6b0d81e61f10"];
  const key = 'danki:warm-pages:e0873f9fb324';
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
