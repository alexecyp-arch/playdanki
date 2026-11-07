const spinDuration = 4000;
const plaqueLimit = 12;
const svgNamespace = 'http://www.w3.org/2000/svg';

// Two engraved paths give the same aged surface each spin without a texture download.
function wearMarks() {
  let seed = 2718;
  const next = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const wood = [];
  const metal = [];
  for (let i = 0; i < 250; i++) {
    const x = Math.round(next() * 248 - 124);
    const y = Math.round(next() * 248 - 124);
    const length = Math.round(next() * 9) + 1;
    wood.push('M' + x + ' ' + y + 'l' + length + ' ' + (i % 3 - 1));
  }
  for (let i = 0; i < 110; i++) {
    const angle = next() * 2 * Math.PI;
    const radius = 128 + next() * 11;
    const x = Math.round(radius * Math.cos(angle) * 10) / 10;
    const y = Math.round(radius * Math.sin(angle) * 10) / 10;
    metal.push('M' + x + ' ' + y + 'l.4 .2');
  }
  return {wood: wood.join(''), metal: metal.join('')};
}
let scars;

const stand = `<svg class="fortuna-stand" viewBox="0 0 296 344" aria-hidden="true" focusable="false">
  <defs><linearGradient id="fortuna-timber"><stop stop-color="#291b13"/><stop offset=".35" stop-color="#76573c"/><stop offset=".65" stop-color="#523923"/><stop offset="1" stop-color="#21150d"/></linearGradient></defs>
  <ellipse cx="148" cy="333" rx="122" ry="8" fill="#0b0705" opacity=".7"/>
  <g fill="url(#fortuna-timber)" stroke="#25140d" stroke-width="3" stroke-linejoin="round">
    <path d="M134 138H162V325H134Z"/>
    <path d="M140 234L61 315H84L148 257L212 315H235L156 234Z"/>
    <path d="M35 310H261L270 325H26Z"/>
    <path d="M27 325H269V334H27Z"/>
  </g>
  <g fill="none" stroke="#ac8961" stroke-opacity=".5" stroke-width="1.5">
    <path d="M143 173Q139 240 144 306M153 174Q158 245 154 302M84 301L134 251M162 251L212 302M48 318Q127 314 246 318M39 329H257"/>
  </g>
  <path d="M28 328L56 326L63 329L99 327M111 317L125 319L141 315L157 317M207 328L227 326L252 330M113 280L120 274L123 269" fill="none" stroke="#24170f" stroke-width="1.8"/>
  <g fill="#8d7346" stroke="#3c2919" stroke-width="1.5">
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
  scars ??= wearMarks();
  const sector = 360 / notes.length;
  const point = angle => {
    const radians = angle * Math.PI / 180;
    return [125 * Math.sin(radians), -125 * Math.cos(radians)].map(n => n.toFixed(3)).join(' ');
  };
  const wedges = notes.length < 2 ? '' : notes.map((_, index) => {
    const start = point(index * sector);
    const end = point((index + 1) * sector);
    return '<path d="M0 0L' + start + 'A125 125 0 0 1 ' + end + 'Z" fill="' +
      (index % 2 ? '#21150e' : '#cfab7a') + '" fill-opacity=".12" stroke="#332419" stroke-width="1.6"/>';
  }).join('');
  wheel.innerHTML = `<svg viewBox="-148 -148 296 296" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="fortuna-gilt" x2="1" y2="1">
        <stop stop-color="#594229"/><stop offset=".19" stop-color="#ad925e"/>
        <stop offset=".37" stop-color="#826b45"/><stop offset=".59" stop-color="#c3a56b"/>
        <stop offset=".78" stop-color="#876842"/><stop offset="1" stop-color="#503a25"/>
      </linearGradient>
      <clipPath id="fortuna-boards"><circle r="125"/></clipPath>
      <radialGradient id="fortuna-wear" cx=".42" cy=".36"><stop offset=".15" stop-color="#1e150e" stop-opacity="0"/><stop offset="1" stop-color="#1e130b" stop-opacity=".68"/></radialGradient>
    </defs>
    <path d="M-6 -144C39 -145 82 -128 111 -92L113 -87L116 -84C135 -57 146 -21 142 12L140 19L142 24C136 64 114 103 80 120L74 120L71 124C28 150 -29 149 -73 123L-77 119L-83 118C-119 94 -142 58 -144 16L-141 11L-144 6C-146 -41 -130 -80 -94 -110L-88 -112L-84 -117C-63 -132 -33 -142 -6 -144Z" fill="#251a11" stroke="#130d08" stroke-width="3"/>
    <circle r="139" fill="url(#fortuna-gilt)" stroke="#786344" stroke-width="2"/>
    <circle r="137" fill="none" stroke="#382a1b" stroke-opacity=".45" stroke-width="6" stroke-dasharray="33 7 17 11 9 23 5 19"/>
    <circle r="132" fill="none" stroke="#35281b" stroke-width="4" stroke-dasharray="2 15 1 11 3 16" stroke-linecap="round"/>
    <path d="${scars.metal}" fill="none" stroke="#302419" stroke-opacity=".59" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M-108 -86l7 5m17 -26 7 5m34 -25 3 8m73 -8-3 9m66 9-4 7m34 45-10 3m15 57-8-2m-18 63-8-5m-25 43-6-8m-70 24 1-8m-65-10 3-7m-51-37 7-5m-32-40 9-2" fill="none" stroke="#cab079" stroke-opacity=".43"/>
    <g clip-path="url(#fortuna-boards)">
      <circle r="126" fill="#76563e"/>
      <path d="M-128 -89L-62 -87L0 -92L127 -87V-50L36 -47L-15 -51L-128 -46Z" fill="#61432e"/>
      <path d="M-128 -45L-65 -48L36 -46L128 -50V-5L54 -9L-16 -4L-128 -7Z" fill="#806246"/>
      <path d="M-128 -6L-16 -3L54 -8L128 -4V37L44 38L-12 32L-128 36Z" fill="#694b35"/>
      <path d="M-128 37L-12 33L44 39L128 38V76L65 73L10 77L-128 74Z" fill="#795941"/>
      <path d="M-128 75L10 78L65 74L128 77V125H-128Z" fill="#604331"/>
      <path d="M-128 -88L-62 -86L0 -91L127 -86M-128 -46L-15 -50L36 -47L128 -49M-128 -6L-16 -3L54 -8L128 -4M-128 36L-12 33L44 39L128 38M-128 74L10 77L65 73L128 76" stroke="#342417" stroke-width="2" fill="none"/>
      <path d="M-122 -104Q-65 -111 -20 -101T113 -106M-126 -74C-75 -90 -28 -58 23 -73S79 -70 123 -77M-125 -62C-80 -75 -12 -51 38 -66S89 -63 123 -64M-123 -31Q-71 -38 -37 -25T120 -30M-122 -19C-67 -40 -50 -10 -7 -20S78 -27 125 -17M-126 11C-60 -5 -47 26 15 14S98 15 125 9M-126 23Q-72 13 -30 28T126 23M-127 55C-51 33 -19 73 29 55S89 52 125 59M-126 65Q-61 53 -24 67T125 67M-120 91C-51 70 -34 111 22 93S97 90 124 91M-113 108Q-57 101 -13 112T111 108" fill="none" stroke="#392619" stroke-opacity=".66"/>
      <path d="M-113 -85L-98 -62L-82 -57L-76 -43L-67 -41M-99 -62L-103 -54L-96 -39M111 37L92 45L78 43L65 51L56 49M92 45L87 54L76 57M-48 94L-29 88L-11 92L5 86L16 89" fill="none" stroke="#2c1c12" stroke-width="2.5"/>
      <path d="M-121 -61Q-103 -80 -84 -70T-47 -62Q-59 -43 -90 -51T-121 -61ZM72 78Q98 56 128 64V108Q102 115 86 98Z" fill="#2d2017" opacity=".35"/>
      <path d="${scars.wood}" fill="none" stroke="#302116" stroke-opacity=".32" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-64 -30q14 -11 28 0q-17 9 -28 0zm8 0q7 -4 14 0q-7 4 -14 0zM46 58q12 -8 23 1q-10 5 -23 -1z" fill="none" stroke="#493020" stroke-width="1.4"/>
      <circle r="126" fill="url(#fortuna-wear)"/>
    </g>
    ${wedges}
    <circle r="125" fill="none" stroke="#4c3520" stroke-width="3"/>
    <circle r="30" fill="#34251b" stroke="#8c7046" stroke-width="3"/>
    <circle r="24" fill="url(#fortuna-gilt)" stroke="#594026" stroke-width="2"/>
    <path d="M-2 -17L4 -6L16 -2L6 4L1 16L-5 6L-17 1L-5 -5Z" fill="#59402a" stroke="#c6ad79" stroke-width="1.2"/>
    <circle r="4" fill="#5d3529" stroke="#a78c64"/>
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
    result.scrollTop = 0;
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
