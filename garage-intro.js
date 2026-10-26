(function () {
  const CAR = `
<svg class="car-svg" viewBox="0 0 600 230" aria-label="2016 Ford Focus ST">
  <defs><linearGradient id="beamGrad" x1="0" x2="1"><stop offset="0" stop-color="#fff8d8" stop-opacity=".6"/><stop offset="1" stop-color="#fff8d8" stop-opacity="0"/></linearGradient></defs>
  <ellipse class="car-shadow" cx="300" cy="200" rx="270" ry="14"/>
  <ellipse class="car-glow" cx="300" cy="198" rx="240" ry="7"/>
  <path class="car-beam" d="M545 138 L700 100 L700 190 Z"/>
  <path class="car-body" d="M38 160 L42 124 Q58 114 112 110 L172 74 Q192 60 232 58 L372 58 Q408 60 428 78 L470 108 Q522 112 548 126 L558 160 L540 170 L60 170 Z"/>
  <path d="M60 128 L540 128" stroke="rgba(0,0,0,.25)" stroke-width="2" fill="none"/>
  <path class="car-body" d="M146 90 L186 66 L196 70 L152 96 Z"/>
  <path class="car-glass" d="M182 106 L206 76 L298 70 L298 106 Z"/>
  <path class="car-glass" d="M308 70 L370 70 Q390 72 402 86 L428 106 L308 106 Z"/>
  <path class="car-body" d="M30 112 L96 106 L96 114 L30 120 Z" style="filter:brightness(.75)"/>
  <rect class="car-tail" x="40" y="124" width="18" height="10" rx="2"/>
  <path class="car-head" d="M520 120 L550 128 L548 138 L518 134 Z"/>
  <path class="car-drl" d="M524 124 Q536 126 548 131"/><path class="car-drl" d="M528 131 Q538 133 546 136"/>
  <path d="M540 150 L556 150" stroke="#222" stroke-width="6"/>
  <text x="316" y="150" font-size="12" font-weight="700" fill="#fff" opacity=".85" font-family="system-ui">ST</text>
  <g class="wheel"><circle cx="135" cy="168" r="42" fill="#05070b"/><circle class="car-tire" cx="135" cy="168" r="34"/>
    <g class="car-spin"><circle class="car-rim" cx="135" cy="168" r="22" fill="#1b2230"/>
    <path class="car-rim" d="M135 148V188M115 168H155M121 154L149 182M149 154L121 182" fill="none"/></g></g>
  <g class="wheel"><circle cx="465" cy="168" r="42" fill="#05070b"/><circle class="car-tire" cx="465" cy="168" r="34"/>
    <g class="car-spin"><circle class="car-rim" cx="465" cy="168" r="22" fill="#1b2230"/>
    <path class="car-rim" d="M465 148V188M445 168H485M451 154L479 182M479 154L451 182" fill="none"/></g></g>
</svg>`;

  function mountHeroCar() {
    const hero = document.getElementById('home');
    if (!hero || document.getElementById('heroCar')) return;
    const strip = document.createElement('div');
    strip.className = 'garage-strip'; strip.id = 'heroCar'; strip.innerHTML = CAR;
    hero.appendChild(strip);
    const svg = strip.querySelector('svg');
    setTimeout(() => svg.classList.add('car-lit'), 600);
    // Mouse tilt
    hero.addEventListener('mousemove', e => {
      const x = (e.clientX / innerWidth - .5) * 2;
      svg.style.transform = `translateX(${x * 14}px) rotate(${x * 0.6}deg)`;
    });
    hero.addEventListener('mouseleave', () => svg.style.transform = '');
    // Wheels spin with scroll
    const spins = strip.querySelectorAll('.car-spin');
    addEventListener('scroll', () => spins.forEach(s => s.style.transform = `rotate(${scrollY * 0.8}deg)`), { passive: true });
  }

  function scrollReveal() {
    const els = document.querySelectorAll('.section-header, .project-card, .about-grid, .contact-layout');
    els.forEach(el => el.classList.add('reveal'));
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
  }

  function runIntro() {
    const seen = sessionStorage.getItem('garageSeen');
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (seen || reduce) { document.body.classList.add('no-intro'); mountHeroCar(); scrollReveal(); return; }

    const el = document.createElement('div');
    el.id = 'garage-intro';
    el.innerHTML = `
      <div class="garage-scene">
        <div class="garage-wall"></div><div class="garage-light"></div><div class="garage-floor"></div>
        <div class="garage-car">${CAR}</div>
        <div class="garage-door">${'<div class="door-panel"></div>'.repeat(6)}</div>
        <div class="door-label">Gary Kanyuh<small>Garage opening…</small></div>
      </div>
      <button class="garage-skip">Skip</button>`;
    document.body.appendChild(el);
    document.body.classList.add('intro-lock');
    mountHeroCar();

    const carSvg = el.querySelector('.car-svg');
    let finished = false;
    const finish = () => {
      if (finished) return; finished = true;
      sessionStorage.setItem('garageSeen', '1');
      el.classList.add('done'); document.body.classList.remove('intro-lock');
      setTimeout(() => { el.remove(); scrollReveal(); }, 950);
    };
    setTimeout(() => el.classList.add('rumble'), 700);
    setTimeout(() => el.classList.add('open'), 900);
    setTimeout(() => el.classList.remove('rumble'), 3000);
    setTimeout(() => carSvg.classList.add('car-lit'), 3000);
    setTimeout(finish, 4600);
    el.querySelector('.garage-skip').addEventListener('click', finish);
  }

  document.addEventListener('DOMContentLoaded', runIntro);
})();
