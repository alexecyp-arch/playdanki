(() => {
  if (window.top !== window) return;
  const connection = navigator.connection;
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return;

  const assets = ["/arithmetic.html","/theme.js?v=4fd65ed5e9b0","/theme.css?v=4fd65ed5e9b0","/analytics.js?v=4fd65ed5e9b0","/data-atlas/ancient-ancestry.html","/data-atlas/ancient-ancestry.html?v=41e7a503d35c","/data-atlas/average-home-size.html","/data-atlas/average-home-size.html?v=41e7a503d35c","/data-atlas/europe-consumption.html","/data-atlas/europe-consumption.html?v=41e7a503d35c","/data-atlas/","/data-atlas/?v=41e7a503d35c","/digit-span/","/digit-span/style.css?v=4fd65ed5e9b0","/digit-span/game.js?v=4495a099dea1","/","/notes-navigation.js?v=4495a099dea1","/account.js?v=4495a099dea1","/temponotes/autumn.js?v=4495a099dea1","/atlas-navigation.js?v=4495a099dea1","/weight-navigation.js?v=4495a099dea1","/timebox-navigation.js?v=4495a099dea1","/programming.html","/quant.html","/temponotes/","/temponotes/?v=4495a099dea1","/temponotes/style.css?v=44bf331ea117","/temponotes/navigation.css?v=336ee232f3f4","/temponotes/autumn.css?v=911dc0824189","/temponotes/bootstrap.js?v=4495a099dea1","/timebox/","/timebox/?v=4495a099dea1","/timebox/style.css?v=73f219fd4c52","/timebox/bootstrap.js?v=4495a099dea1","/weight-tracker/","/weight-tracker/?v=4495a099dea1","/weight-tracker/style.css?v=4dc78c0fd39b","/weight-tracker/bootstrap.js?v=4495a099dea1"];
  const key = 'danki:warm-pages:19305e5f52b1';
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
