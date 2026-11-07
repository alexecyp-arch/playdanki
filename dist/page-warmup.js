(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=13306f78dd86","/theme.css?v=13306f78dd86","/analytics.js?v=13306f78dd86","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=e2b4b8198682","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=e2b4b8198682","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=e2b4b8198682","/data-atlas/","/data-atlas/?v=e2b4b8198682","/digit-span/","/digit-span/style.css?v=13306f78dd86","/digit-span/game.js?v=0935dabefaa3","/","/notes-navigation.js?v=0935dabefaa3","/account.js?v=0935dabefaa3","/temponotes/autumn.js?v=0935dabefaa3","/atlas-navigation.js?v=0935dabefaa3","/weight-navigation.js?v=0935dabefaa3","/timebox-navigation.js?v=0935dabefaa3","/programming.html","/quant.html","/temponotes/","/temponotes/?v=0935dabefaa3","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=5cf90dc63d37","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=0935dabefaa3","/timebox/","/timebox/?v=0935dabefaa3","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=0935dabefaa3","/weight-tracker/","/weight-tracker/?v=0935dabefaa3","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=0935dabefaa3"];
  const key = 'danki:warm-pages:f84929951c19';
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
