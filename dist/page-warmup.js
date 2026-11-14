(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=4b8e0a2da563","/theme.css?v=4b8e0a2da563","/analytics.js?v=4b8e0a2da563","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=9148df817159","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=9148df817159","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=9148df817159","/data-atlas/","/data-atlas/?v=9148df817159","/digit-span/","/digit-span/style.css?v=4b8e0a2da563","/digit-span/game.js?v=9b4867a81ddf","/","/notes-navigation.js?v=9b4867a81ddf","/account.js?v=9b4867a81ddf","/temponotes/autumn.js?v=9b4867a81ddf","/atlas-navigation.js?v=9b4867a81ddf","/weight-navigation.js?v=9b4867a81ddf","/timebox-navigation.js?v=9b4867a81ddf","/programming.html","/quant.html","/temponotes/","/temponotes/?v=9b4867a81ddf","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=336ee232f3f4","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=9b4867a81ddf","/timebox/","/timebox/?v=9b4867a81ddf","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=9b4867a81ddf","/weight-tracker/","/weight-tracker/?v=9b4867a81ddf","/weight-tracker/style.css?v=4dc78c0fd39b","/weight-tracker/bootstrap.js?v=9b4867a81ddf"];
  const key = 'danki:warm-pages:071ee4e19fc8';
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
