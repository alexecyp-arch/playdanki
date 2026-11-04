(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=1921c945b29d","/theme.css?v=1921c945b29d","/analytics.js?v=1921c945b29d","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=6a0f284c7c2b","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=6a0f284c7c2b","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=6a0f284c7c2b","/data-atlas/","/data-atlas/?v=6a0f284c7c2b","/digit-span/","/digit-span/style.css?v=1921c945b29d","/digit-span/game.js?v=a605f4b1d8fd","/","/notes-navigation.js?v=a605f4b1d8fd","/account.js?v=a605f4b1d8fd","/temponotes/autumn.js?v=a605f4b1d8fd","/atlas-navigation.js?v=a605f4b1d8fd","/weight-navigation.js?v=a605f4b1d8fd","/timebox-navigation.js?v=a605f4b1d8fd","/programming.html","/quant.html","/temponotes/","/temponotes/?v=a605f4b1d8fd","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=b71cf47ccc88","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=a605f4b1d8fd","/timebox/","/timebox/?v=a605f4b1d8fd","/timebox/style.css?v=e8704ac8a0c6","/timebox/bootstrap.js?v=a605f4b1d8fd","/weight-tracker/","/weight-tracker/?v=a605f4b1d8fd","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=a605f4b1d8fd"];
  const key = 'danki:warm-pages:f4097497ad43';
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
