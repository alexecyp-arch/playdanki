(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=13306f78dd86","/theme.css?v=13306f78dd86","/analytics.js?v=13306f78dd86","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=e2b4b8198682","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=e2b4b8198682","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=e2b4b8198682","/data-atlas/","/data-atlas/?v=e2b4b8198682","/digit-span/","/digit-span/style.css?v=13306f78dd86","/digit-span/game.js?v=1a712fa7bca4","/","/notes-navigation.js?v=1a712fa7bca4","/account.js?v=1a712fa7bca4","/temponotes/autumn.js?v=1a712fa7bca4","/atlas-navigation.js?v=1a712fa7bca4","/weight-navigation.js?v=1a712fa7bca4","/timebox-navigation.js?v=1a712fa7bca4","/programming.html","/quant.html","/temponotes/","/temponotes/?v=1a712fa7bca4","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=3e30ab91c899","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=1a712fa7bca4","/timebox/","/timebox/?v=1a712fa7bca4","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=1a712fa7bca4","/weight-tracker/","/weight-tracker/?v=1a712fa7bca4","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=1a712fa7bca4"];
  const key = 'danki:warm-pages:4bfb7c2fad62';
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
