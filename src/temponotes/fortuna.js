const spinDuration = 4000;
const plaqueLimit = 12;
const svgNamespace = 'http://www.w3.org/2000/svg';

const stand = `<svg class="fortuna-stand" viewBox="0 0 296 344" aria-hidden="true" focusable="false">
  <defs><linearGradient id="fortuna-timber"><stop stop-color="#301a10"/><stop offset=".35" stop-color="#97653a"/><stop offset=".65" stop-color="#694121"/><stop offset="1" stop-color="#2b170d"/></linearGradient></defs>
  <ellipse cx="148" cy="333" rx="122" ry="8" fill="#0b0705" opacity=".7"/>
  <g fill="url(#fortuna-timber)" stroke="#25140d" stroke-width="3" stroke-linejoin="round">
    <path d="M134 138H162V325H134Z"/>
    <path d="M140 234L61 315H84L148 257L212 315H235L156 234Z"/>
    <path d="M35 310H261L270 325H26Z"/>
    <path d="M27 325H269V334H27Z"/>
  </g>
  <g fill="none" stroke="#c08b55" stroke-opacity=".55" stroke-width="1.6">
    <path d="M143 173Q139 240 144 306M153 174Q158 245 154 302M84 301L134 251M162 251L212 302M48 318Q127 314 246 318M39 329H257"/>
  </g>
  <g fill="#b58a44" stroke="#3c2411" stroke-width="1.5">
    <circle cx="148" cy="305" r="5"/><circle cx="63" cy="322" r="4"/><circle cx="233" cy="322" r="4"/>
  </g>
</svg>`;

function wheelNotes(notes) {
  if (notes.length <= plaqueLimit) return notes;
  const candidates = notes.slice();
  // A partial shuffle gives every active note the same chance of a place on the wheel.
  for (let i = 0; i < plaqueLimit; i++) {
    const j = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }
  return candidates.slice(0, plaqueLimit);
}

function drawWheel(wheel, notes) {
  const sector = 360 / notes.length;
  const point = angle => {
    const radians = angle * Math.PI / 180;
    return [125 * Math.sin(radians), -125 * Math.cos(radians)].map(n => n.toFixed(3)).join(' ');
  };
  const wedges = notes.length < 2 ? '' : notes.map((_, index) => {
    const start = point(index * sector);
    const end = point((index + 1) * sector);
    return '<path d="M0 0L' + start + 'A125 125 0 0 1 ' + end + 'Z" fill="' +
      (index % 2 ? '#241208' : '#e7a760') + '" fill-opacity=".16" stroke="#331b0e" stroke-width="2"/>';
  }).join('');
  wheel.innerHTML = `<svg viewBox="-148 -148 296 296" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="fortuna-gilt" x2="1" y2="1">
        <stop stop-color="#795023"/><stop offset=".22" stop-color="#f2d488"/>
        <stop offset=".45" stop-color="#b18239"/><stop offset=".67" stop-color="#edc875"/>
        <stop offset="1" stop-color="#6e461d"/>
      </linearGradient>
      <pattern id="fortuna-oak" width="122" height="84" patternUnits="userSpaceOnUse">
        <path d="M0 0H122V30H0Z" fill="#91603a"/><path d="M0 30H122V57H0Z" fill="#764725"/>
        <path d="M0 57H122V84H0Z" fill="#855331"/>
        <path d="M0 0H122M0 30H122M0 57H122" stroke="#3f2416" stroke-width="2"/>
        <g fill="none" stroke="#4c2a17" stroke-opacity=".68">
          <path d="M0 9C29 3 60 20 122 9M0 15C38 6 61 28 122 15M0 23C35 13 82 31 122 23"/>
          <path d="M0 39C35 28 46 55 82 42S110 40 122 39M0 47C31 35 62 61 95 47H122"/>
          <path d="M0 65Q29 58 59 68T122 65M0 72Q33 63 62 75T122 72M0 79Q39 72 72 80T122 79"/>
          <ellipse cx="56" cy="15" rx="14" ry="4"/><ellipse cx="56" cy="15" rx="8" ry="2"/>
          <ellipse cx="91" cy="69" rx="9" ry="3"/>
        </g>
        <path d="M0 3H122M0 33H122M0 60H122" stroke="#d49e62" stroke-opacity=".55"/>
      </pattern>
      <radialGradient id="fortuna-wear"><stop offset=".65" stop-color="#25150d" stop-opacity="0"/><stop offset="1" stop-color="#211008" stop-opacity=".63"/></radialGradient>
    </defs>
    <circle r="144" fill="#241209" stroke="#130b07" stroke-width="3"/>
    <circle r="140" fill="url(#fortuna-gilt)" stroke="#f4d382" stroke-width="2"/>
    <circle r="133" fill="none" stroke="#60401e" stroke-width="4" stroke-dasharray="1 8" stroke-linecap="round"/>
    <circle r="126" fill="url(#fortuna-oak)" stroke="#503014" stroke-width="3"/>
    <circle r="124" fill="url(#fortuna-wear)"/>
    ${wedges}
    <circle r="123" fill="none" stroke="#d7a95e" stroke-opacity=".65"/>
    <circle r="31" fill="#3e2615" stroke="#b98d4b" stroke-width="3"/>
    <circle r="25" fill="url(#fortuna-gilt)" stroke="#5d361a" stroke-width="2"/>
    <path d="M0 -17L4 -5L17 0L4 5L0 17L-4 5L-17 0L-4 -5Z" fill="#673a20" stroke="#ffe8aa" stroke-width="1.5"/>
    <circle r="4" fill="#802f25" stroke="#ffdfa1"/>
  </svg>`;
  const face = wheel.firstElementChild;
  const width = Math.min(102, Math.max(35, 144 * Math.tan(Math.PI / Math.max(2, notes.length)) - 7));
  notes.forEach((note, index) => {
    const plaque = document.createElementNS(svgNamespace, 'g');
    plaque.setAttribute('class', 'fortuna-plaque');
    plaque.setAttribute('transform', 'rotate(' + (index + .5) * sector + ') translate(0 -83)');
    plaque.innerHTML = '<rect x="' + -width / 2 + '" y="-16" width="' + width + '" height="32" rx="2"/>' +
      '<foreignObject x="' + (-width / 2 + 4) + '" y="-13" width="' + (width - 8) + '" height="26"></foreignObject>';
    const label = document.createElement('div');
    label.className = 'fortuna-label';
    label.textContent = note.body.slice(0, 160);
    plaque.lastElementChild.append(label);
    face.append(plaque);
  });
  return face;
}

export function mountFortuna(tools, getNotes) {
  const area = document.createElement('div');
  area.className = 'fortuna-area';
  area.innerHTML = '<button type="button" class="fortuna-toggle" aria-expanded="false" aria-controls="fortuna-panel" disabled>FORTUNA</button>' +
    '<section id="fortuna-panel" class="fortuna-panel" aria-label="Fortuna" hidden>' +
    '<div class="fortuna-rig">' + stand + '<button type="button" class="fortuna-wheel" aria-label="Spin the wheel"></button></div>' +
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
    const notes = wheelNotes(getNotes());
    if (!notes.length) return;
    const index = Math.floor(Math.random() * notes.length);
    const id = notes[index].id;
    const target = (360 - (index + .5) * 360 / notes.length) % 360;
    const end = rotation + 1800 + (target - rotation + 360) % 360;
    winnerId = null;
    result.textContent = '';
    panel.scrollTop = 0;
    const face = drawWheel(wheel, notes);
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
      if (winner) face.querySelectorAll('.fortuna-plaque')[index].classList.add('fortuna-picked');
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
