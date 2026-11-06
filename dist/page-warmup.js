(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=38f41e62dfce","/theme.css?v=38f41e62dfce","/analytics.js?v=38f41e62dfce","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=584a40354f42","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=584a40354f42","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=584a40354f42","/data-atlas/","/data-atlas/?v=584a40354f42","/digit-span/","/digit-span/style.css?v=38f41e62dfce","/digit-span/game.js?v=37d61ac53f7d","/","/notes-navigation.js?v=37d61ac53f7d","/account.js?v=37d61ac53f7d","/temponotes/autumn.js?v=37d61ac53f7d","/atlas-navigation.js?v=37d61ac53f7d","/weight-navigation.js?v=37d61ac53f7d","/timebox-navigation.js?v=37d61ac53f7d","/programming.html","/quant.html","/temponotes/","/temponotes/?v=37d61ac53f7d","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=e179141cba3f","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=37d61ac53f7d","/timebox/","/timebox/?v=37d61ac53f7d","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=37d61ac53f7d","/weight-tracker/","/weight-tracker/?v=37d61ac53f7d","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=37d61ac53f7d"];
  const key = 'danki:warm-pages:afa13215fa32';
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
