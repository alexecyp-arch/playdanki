(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=3137fa0e6169","/theme.css?v=3137fa0e6169","/analytics.js?v=3137fa0e6169","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=aba34e66b8d9","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=aba34e66b8d9","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=aba34e66b8d9","/data-atlas/","/data-atlas/?v=aba34e66b8d9","/digit-span/","/digit-span/style.css?v=3137fa0e6169","/digit-span/game.js?v=ddd788d02883","/","/notes-navigation.js?v=ddd788d02883","/account.js?v=ddd788d02883","/temponotes/autumn.js?v=ddd788d02883","/atlas-navigation.js?v=ddd788d02883","/weight-navigation.js?v=ddd788d02883","/timebox-navigation.js?v=ddd788d02883","/programming.html","/quant.html","/temponotes/","/temponotes/?v=ddd788d02883","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=11769dba088a","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=ddd788d02883","/timebox/","/timebox/?v=ddd788d02883","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=ddd788d02883","/weight-tracker/","/weight-tracker/?v=ddd788d02883","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=ddd788d02883"];
  const key = 'danki:warm-pages:adc79b386467';
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
