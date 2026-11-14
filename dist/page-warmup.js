(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=4b8e0a2da563","/theme.css?v=4b8e0a2da563","/analytics.js?v=4b8e0a2da563","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=9148df817159","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=9148df817159","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=9148df817159","/data-atlas/","/data-atlas/?v=9148df817159","/digit-span/","/digit-span/style.css?v=4b8e0a2da563","/digit-span/game.js?v=cebdfc99aea2","/","/notes-navigation.js?v=cebdfc99aea2","/account.js?v=cebdfc99aea2","/temponotes/autumn.js?v=cebdfc99aea2","/atlas-navigation.js?v=cebdfc99aea2","/weight-navigation.js?v=cebdfc99aea2","/timebox-navigation.js?v=cebdfc99aea2","/programming.html","/quant.html","/temponotes/","/temponotes/?v=cebdfc99aea2","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=336ee232f3f4","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=cebdfc99aea2","/timebox/","/timebox/?v=cebdfc99aea2","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=cebdfc99aea2","/weight-tracker/","/weight-tracker/?v=cebdfc99aea2","/weight-tracker/style.css?v=95e35f89a653","/weight-tracker/bootstrap.js?v=cebdfc99aea2"];
  const key = 'danki:warm-pages:3a8c80e42253';
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
