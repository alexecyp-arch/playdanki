(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=30a601410a87","/theme.css?v=30a601410a87","/analytics.js?v=30a601410a87","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=6caed8261244","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=6caed8261244","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=6caed8261244","/data-atlas/","/data-atlas/?v=6caed8261244","/digit-span/","/digit-span/style.css?v=30a601410a87","/digit-span/game.js?v=dd158c3502f2","/","/notes-navigation.js?v=dd158c3502f2","/account.js?v=dd158c3502f2","/temponotes/autumn.js?v=dd158c3502f2","/atlas-navigation.js?v=dd158c3502f2","/weight-navigation.js?v=dd158c3502f2","/programming.html","/quant.html","/temponotes/","/temponotes/?v=dd158c3502f2","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=2c9b67b0c8c5","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=dd158c3502f2","/timebox/","/timebox/?v=dd158c3502f2","/weight-tracker/","/weight-tracker/?v=dd158c3502f2","/weight-tracker/style.css?v=9b1f01ba93b8","/weight-tracker/bootstrap.js?v=dd158c3502f2"];
  const key = 'danki:warm-pages:6f93a48ffa1c';
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
