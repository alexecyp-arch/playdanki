(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=bddc8e721af9","/theme.css?v=bddc8e721af9","/analytics.js?v=bddc8e721af9","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=4554c423d495","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=4554c423d495","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=4554c423d495","/data-atlas/","/data-atlas/?v=4554c423d495","/digit-span/","/digit-span/style.css?v=bddc8e721af9","/digit-span/game.js?v=7cc83b87e729","/","/notes-navigation.js?v=7cc83b87e729","/account.js?v=7cc83b87e729","/temponotes/autumn.js?v=7cc83b87e729","/atlas-navigation.js?v=7cc83b87e729","/weight-navigation.js?v=7cc83b87e729","/timebox-navigation.js?v=7cc83b87e729","/programming.html","/quant.html","/temponotes/","/temponotes/?v=7cc83b87e729","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=e179141cba3f","/temponotes/autumn.css?v=56909551a424","/temponotes/bootstrap.js?v=7cc83b87e729","/timebox/","/timebox/?v=7cc83b87e729","/timebox/style.css?v=854f712f672b","/timebox/bootstrap.js?v=7cc83b87e729","/weight-tracker/","/weight-tracker/?v=7cc83b87e729","/weight-tracker/style.css?v=bbd5c10224f4","/weight-tracker/bootstrap.js?v=7cc83b87e729"];
  const key = 'danki:warm-pages:b840618f1aa0';
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
