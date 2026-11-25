(() => {
  'use strict';
  const routes = new Map([
    ['/temponotes/', {id: 'notes', title: 'Temponote'}],
    ['/weight-tracker/', {id: 'weight', title: 'DAILY LOGS'}],
    ['/monthly-logs/', {id: 'monthly', title: 'MONTHLY LOGS'}],
  ]);
  const links = '.home-page-links a, #notes-navigation a, header .page-links a';
  const regularClick = event =>
    !event.defaultPrevented && event.button === 0 && !event.ctrlKey &&
    !event.metaKey && !event.shiftKey && !event.altKey;
  const linkPath = link => link?.origin === location.origin ? link.pathname : '';
  let embedded = false;
  if (parent !== window) {
    try { embedded = window.frameElement?.classList.contains('private-route-frame'); } catch {}
    if (!embedded) return;
    document.addEventListener('click', event => {
      const path = linkPath(event.target.closest?.(links));
      if (!regularClick(event) || (path !== '/' && !routes.has(path))) return;
      event.preventDefault();
      parent.postMessage({type: 'danki-private-navigate', path}, location.origin);
    });
    return;
  }

  const hostPath = location.pathname.replace(/index\.html$/, '');
  const host = routes.get(hostPath);
  if (!host && !document.querySelector('.home-page-links')) return;
  const frames = new Map();
  const style = document.createElement('style');
  style.textContent =
    'iframe.private-route-frame{display:block!important;position:fixed;inset:0;width:100%;height:100dvh;border:0;z-index:1000;background:var(--danki-bg,#141518)}' +
    'iframe.private-route-frame[hidden]{visibility:hidden;pointer-events:none}body.private-route-open{overflow:hidden}';
  document.head.append(style);
  let uid = null;
  let active = null;
  let hostUrl = location.pathname + location.search + location.hash;
  let hostTitle = document.title;
  let returnLink = null;
  let warming = null;
  let fallback;

  function showFrame(record, visible) {
    const {frame, route} = record;
    frame.inert = frame.hidden = !visible;
    if (record.visible === visible) return;
    record.visible = visible;
    frame.contentWindow?.postMessage({type: 'danki-' + route.id + '-visibility', visible}, location.origin);
  }

  function prepare(path) {
    if (frames.has(path)) return frames.get(path);
    const route = routes.get(path);
    const frame = document.createElement('iframe');
    frame.className = 'private-route-frame';
    frame.id = 'private-' + route.id + '-frame';
    frame.title = route.title;
    frame.inert = frame.hidden = true;
    frame.src = path + '?v=PRIVATE_ROUTES_RELEASE';
    const record = {frame, route, visible: false, loaded: false};
    frames.set(path, record);
    frame.addEventListener('load', () => {
      if (frames.get(path) !== record) return;
      record.loaded = true;
      record.visible = null;
      showFrame(record, active === path);
      scheduleWarmup();
    });
    document.body.append(frame);
    return record;
  }

  function scheduleWarmup() {
    if (!uid || document.hidden || warming || navigator.connection?.saveData ||
        /(^|-)2g$/.test(navigator.connection?.effectiveType || '')) return;
    if ([...frames.values()].some(record => !record.loaded)) return;
    const path = [...routes.keys()].find(candidate => candidate !== hostPath && !frames.has(candidate));
    if (!path) return;
    const visit = {uid};
    warming = visit;
    const start = () => {
      if (warming !== visit) return;
      warming = null;
      if (visit.uid !== uid || document.hidden || [...frames.values()].some(record => !record.loaded)) return;
      if (frames.has(path)) scheduleWarmup();
      else prepare(path);
    };
    if (window.requestIdleCallback) window.requestIdleCallback(start, {timeout: 1300});
    else setTimeout(start, 160);
  }

  function hide() {
    clearTimeout(fallback);
    if (active) {
      const record = frames.get(active);
      if (record) showFrame(record, false);
    }
    active = null;
    document.body.classList.remove('notes-open', 'weight-open', 'monthly-open', 'private-route-open');
    if (host?.id === 'notes') window.dispatchEvent(new CustomEvent('temponotes-visibility', {detail: true}));
  }

  function display(path) {
    const old = active;
    clearTimeout(fallback);
    if (old && old !== path) showFrame(frames.get(old), false);
    if (!path) {
      hide();
      document.title = hostTitle;
      returnLink?.focus({preventScroll: true});
      return;
    }
    active = path;
    const record = prepare(path);
    window.dispatchEvent(new CustomEvent('danki-view-opening', {detail: record.route.id}));
    for (const route of routes.values()) document.body.classList.toggle(route.id + '-open', record.route === route);
    document.body.classList.add('private-route-open');
    if (host?.id === 'notes') window.dispatchEvent(new CustomEvent('temponotes-visibility', {detail: false}));
    document.title = record.route.title;
    showFrame(record, true);
    record.frame.contentWindow?.focus();
    if (!record.loaded) fallback = setTimeout(() => {
      if (active !== path || frames.get(path) !== record) return;
      try {
        if (record.frame.contentDocument && record.frame.contentDocument.URL !== 'about:blank') return;
      } catch {}
      location.assign(path);
    }, 1800);
  }

  function go(path) {
    if (host && path === '/') {
      location.assign('/');
      return;
    }
    if (path === hostPath || (!host && path === '/')) {
      history.replaceState(null, '', hostUrl);
      display(null);
    } else if (routes.has(path) && active !== path) {
      history.pushState(null, '', path);
      display(path);
    }
  }

  function clearFrames() {
    for (const {frame} of frames.values()) frame.remove();
    frames.clear();
    warming = null;
    uid = null;
  }

  function clearAccount() {
    if (active) {
      history.replaceState(null, '', hostUrl);
      hide();
      document.title = hostTitle;
    }
    clearFrames();
  }
  const authEvent = host ? 'danki-private-auth' : 'danki-auth';
  window.addEventListener(authEvent + '-clearing', clearAccount);
  window.addEventListener(authEvent, event => {
    const next = event.detail || null;
    if (next !== uid) clearAccount();
    uid = next;
    scheduleWarmup();
  });
  document.addEventListener('visibilitychange', scheduleWarmup);
  document.addEventListener('click', event => {
    const link = event.target.closest?.(links);
    const path = linkPath(link);
    if (!uid || !regularClick(event) || !routes.has(path) || path === hostPath) return;
    event.preventDefault();
    if (!active) {
      hostUrl = location.pathname + location.search + location.hash;
      hostTitle = document.title;
      returnLink = link;
    }
    go(path);
  });
  window.addEventListener('message', event => {
    if (!uid || !active || event.origin !== location.origin || event.source !== frames.get(active)?.frame.contentWindow) return;
    if (event.data?.type === 'danki-private-navigate') go(event.data.path);
    if (event.data?.type === 'danki-frame-blocked') location.assign(active);
  });
  window.addEventListener('danki-view-opening', event => {
    if (!routes.has(active) || routes.get(active).id === event.detail) return;
    hide();
  });
  window.addEventListener('popstate', () => {
    const path = location.pathname;
    if (path !== hostPath && routes.has(path)) {
      if (uid) display(path);
      else location.reload();
    } else if (active) {
      if (path.startsWith('/data-atlas/')) hide();
      else display(null);
    }
  });
  window.addEventListener('pagehide', () => { clearTimeout(fallback); clearFrames(); });
  window.addEventListener('pageshow', event => { if (event.persisted) location.reload(); });
})();
