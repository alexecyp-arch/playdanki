const spinDuration = 4000;
const sectorColors = ['#793c3d', '#314e65', '#526142', '#9d7844', '#62445c'];

function wheelFace(count) {
  const sector = 360 / count;
  const point = angle => {
    const radians = angle * Math.PI / 180;
    return [98 * Math.sin(radians), -98 * Math.cos(radians)].map(n => n.toFixed(3)).join(' ');
  };
  const wedges = count === 1 ? '<circle r="98" fill="#793c3d"/>' :
    Array.from({length: count}, (_, index) => {
      const start = point(index * sector);
      const end = point((index + 1) * sector);
      return '<path d="M0 0L' + start + 'A98 98 0 0 1 ' + end + 'Z" fill="' +
        sectorColors[index % sectorColors.length] + '" stroke="#d9b879" stroke-width="1"/>';
    }).join('');
  return '<svg viewBox="-124 -124 248 248" aria-hidden="true" focusable="false">' +
    '<defs><radialGradient id="fortuna-gilt"><stop stop-color="#f6d992"/><stop offset=".73" stop-color="#b18445"/><stop offset="1" stop-color="#76502a"/></radialGradient></defs>' +
    '<circle r="119" fill="#120d0c" stroke="#e0bd73" stroke-width="2"/>' +
    '<circle r="115" fill="url(#fortuna-gilt)" stroke="#402517" stroke-width="2"/>' +
    '<circle r="108" fill="none" stroke="#3f2819" stroke-width="4" stroke-dasharray="1 6" stroke-linecap="round"/>' +
    '<circle r="102" fill="#2f1b13" stroke="#f0cf89" stroke-width="2"/>' + wedges +
    '<circle r="91" fill="none" stroke="#f2d397" stroke-opacity=".45"/>' +
    '<circle r="72" fill="none" stroke="#f2d397" stroke-opacity=".3" stroke-dasharray="2 4"/>' +
    '<circle r="32" fill="#2d1c16" stroke="#e7c384" stroke-width="2"/>' +
    '<circle r="27" fill="url(#fortuna-gilt)" stroke="#76502a"/>' +
    '<path d="M-17 6L-20 -8L-9 -2L0 -15L9 -2L20 -8L17 6ZM-15 10H15V14H-15Z" fill="#533021" stroke="#ffe4ab" stroke-width="1.5"/>' +
    '<path d="M0 -7L3 -1L0 5L-3 -1Z" fill="#b64546"/>' +
    '</svg>';
}

export function mountFortuna(tools, getNotes) {
  const area = document.createElement('div');
  area.className = 'fortuna-area';
  area.innerHTML = '<button type="button" class="fortuna-toggle" aria-expanded="false" aria-controls="fortuna-panel" disabled>FORTUNA</button>' +
    '<section id="fortuna-panel" class="fortuna-panel" aria-label="Fortuna" hidden>' +
    '<button type="button" class="fortuna-wheel" aria-label="Spin the wheel"></button>' +
    '<p class="fortuna-result" aria-live="polite"></p></section>';
  tools.append(area);
  const toggle = area.querySelector('.fortuna-toggle');
  const panel = area.querySelector('.fortuna-panel');
  const wheel = area.querySelector('.fortuna-wheel');
  const result = area.querySelector('.fortuna-result');
  const listeners = new AbortController();
  const options = {signal: listeners.signal};
  let spin = null;
  let rotation = 0;
  let winnerId = null;

  function close() {
    spin?.cancel();
    spin = null;
    rotation = 0;
    winnerId = null;
    result.textContent = '';
    wheel.replaceChildren();
    wheel.removeAttribute('aria-disabled');
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  function fit() {
    if (panel.hidden) return;
    const top = tools.getBoundingClientRect().top;
    panel.style.setProperty('--fortuna-space', Math.max(64, top - 16) + 'px');
  }

  function start() {
    if (spin) return;
    const notes = getNotes();
    if (!notes.length) return;
    const index = Math.floor(Math.random() * notes.length);
    const id = notes[index].id;
    const target = (360 - (index + .5) * 360 / notes.length) % 360;
    const end = rotation + 1800 + (target - rotation + 360) % 360;
    winnerId = null;
    result.textContent = '';
    panel.scrollTop = 0;
    wheel.innerHTML = wheelFace(notes.length);
    const face = wheel.firstElementChild;
    wheel.setAttribute('aria-disabled', 'true');
    const animation = face.animate([{transform: 'rotate(' + rotation + 'deg)'}, {transform: 'rotate(' + end + 'deg)'}],
      {duration: spinDuration, easing: 'cubic-bezier(.12,.67,.14,1)', fill: 'forwards'});
    spin = animation;
    animation.onfinish = () => {
      if (spin !== animation) return;
      rotation = target;
      face.style.transform = 'rotate(' + rotation + 'deg)';
      animation.cancel();
      spin = null;
      wheel.removeAttribute('aria-disabled');
      const winner = getNotes().find(note => note.id === id);
      winnerId = winner?.id ?? null;
      result.textContent = winner?.body ?? '';
    };
  }

  toggle.addEventListener('click', () => {
    if (!panel.hidden) return close();
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    fit();
    start();
  }, options);
  wheel.addEventListener('click', start, options);
  document.addEventListener('click', event => {
    if (!panel.hidden && !event.composedPath().includes(area)) close();
  }, options);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      event.preventDefault();
      close();
      toggle.focus();
    }
  }, options);
  window.addEventListener('resize', fit, options);

  return {
    render(notes) {
      toggle.disabled = notes.length === 0;
      if (!notes.length && !panel.hidden) close();
      else if (winnerId !== null) {
        const winner = notes.find(note => note.id === winnerId);
        const body = winner?.body ?? '';
        if (result.textContent !== body) result.textContent = body;
        winnerId = winner?.id ?? null;
      }
    },
    close,
    dispose() {
      close();
      listeners.abort();
    }
  };
}
