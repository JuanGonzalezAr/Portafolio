/* ==========================================================
   Portafolio · Juan Sebastián González
   Animaciones: GSAP + ScrollTrigger + SplitText, scroll suave con Lenis.
   Todo el código es propio; la estética se inspira en neutomni.com.
   ========================================================== */
(() => {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Oculta lo que se animará de entrada (solo si GSAP cargó y el usuario acepta movimiento)
  if (!reduce && window.gsap) root.classList.add('gsap-ready');

  /* ---------- Relojes (hora de Medellín) ---------- */
  const tz = 'America/Bogota';
  const fShort = new Intl.DateTimeFormat('es-CO', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false });
  const fFull = new Intl.DateTimeFormat('es-CO', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const fTask = new Intl.DateTimeFormat('es-CO', { timeZone: tz, weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  function tick() {
    const d = new Date();
    $$('[data-clock-short]').forEach(e => (e.textContent = fShort.format(d)));
    $$('[data-clock]').forEach(e => (e.textContent = fFull.format(d) + ' (COT)'));
    $$('[data-clock-task]').forEach(e => (e.textContent = fTask.format(d)));
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Logotipo: ajusta la fuente para ocupar todo el ancho ---------- */
  function fitWordmark(el) {
    const word = $('.wm__word', el);
    if (!word) return;
  }
  function fitAll() {
    $$('.wm').forEach(fitWordmark);
    const h = $('.wm--hero');
    if (h) root.style.setProperty('--wmh', h.offsetHeight + 'px');
  }

  /* ---------- Figura que cambia de forma (acento de la Á) ---------- */
  function morph() {
    const polys = $$('.wm__shape polygon');
    if (!polys.length) return;
    const seq = [3, 4, 5, 6, 8, 12, 40];
    const pts = (n, rot, r = 0.94) => {
      const out = [];
      for (let i = 0; i < n; i++) {
        const a = rot + (i / n) * Math.PI * 2 - Math.PI / 2;
        out.push((Math.cos(a) * r).toFixed(3) + ',' + (Math.sin(a) * r).toFixed(3));
      }
      return out.join(' ');
    };
    if (reduce) { polys.forEach(p => p.setAttribute('points', pts(40, 0))); return; }
    const loop = t => {
      const s = t / 1000;
      const n = seq[Math.floor(s / 0.6) % seq.length];
      const p = pts(n, s * 1.4);
      polys.forEach(el => el.setAttribute('points', p));
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------- Códigos de barras decorativos ---------- */
  function barcodes() {
    $$('.barcode').forEach(svg => {
      let s = +svg.dataset.seed || 7;
      const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
      let x = 0, out = '';
      while (x < 300) {
        const w = 1 + Math.floor(rnd() * 4);
        const gap = 1 + Math.floor(rnd() * 3);
        if (rnd() > 0.12) out += `<rect x="${x}" y="0" width="${w}" height="46"/>`;
        x += w + gap;
      }
      svg.setAttribute('viewBox', `0 0 ${x} 46`);
      svg.innerHTML = out;
    });
  }

  /* ---------- Ventanas arrastrables de la computadora ---------- */
  function windows() {
    const screen = $('.crt__screen');
    if (!screen) return;
    let z = 10;
    const front = w => { w.style.zIndex = ++z; };
    $$('.win').forEach(w => {
      const bar = $('.win__bar', w);
      const close = $('.win__x', w);
      let id = null, sx = 0, sy = 0, ox = 0, oy = 0;
      w.addEventListener('pointerdown', () => front(w));
      close.addEventListener('click', () => { w.hidden = true; });
      bar.addEventListener('pointerdown', e => {
        if (e.target.closest('.win__x')) return;
        id = e.pointerId;
        bar.setPointerCapture(id);
        sx = e.clientX; sy = e.clientY; ox = w.offsetLeft; oy = w.offsetTop;
        bar.classList.add('is-drag');
      });
      bar.addEventListener('pointermove', e => {
        if (id !== e.pointerId) return;
        const sc = screen.getBoundingClientRect().width / screen.offsetWidth || 1;
        let nx = ox + (e.clientX - sx) / sc;
        let ny = oy + (e.clientY - sy) / sc;
        nx = Math.max(0, Math.min(nx, screen.clientWidth - w.offsetWidth));
        ny = Math.max(0, Math.min(ny, screen.clientHeight - w.offsetHeight - 22));
        w.style.left = (nx / screen.clientWidth * 100) + '%';
        w.style.top = (ny / screen.clientHeight * 100) + '%';
      });
      const end = e => { if (id === e.pointerId) { id = null; bar.classList.remove('is-drag'); } };
      bar.addEventListener('pointerup', end);
      bar.addEventListener('pointercancel', end);
    });
    $$('.icon').forEach(b => b.addEventListener('click', () => {
      const w = document.getElementById(b.dataset.open);
      if (!w) return;
      w.hidden = false;
      front(w);
    }));
  }

  /* ---------- Rombo "Hablemos": se arrastra a lo largo de la línea ---------- */
  function diamond() {
    const dm = $('.diamond'), rail = $('.rail');
    if (!dm || !rail) return;
    let dx = 0, startX = 0, moved = false, active = false;
    dm.addEventListener('pointerdown', e => {
      active = true; moved = false; startX = e.clientX - dx;
      dm.setPointerCapture(e.pointerId);
      dm.classList.add('is-drag');
    });
    dm.addEventListener('pointermove', e => {
      if (!active) return;
      const max = rail.clientWidth - dm.offsetWidth;
      const nx = Math.min(Math.max(e.clientX - startX, 0), Math.max(0, max));
      if (Math.abs(nx - dx) > 3) moved = true;
      dx = nx;
      dm.style.transform = `translateX(${dx}px)`;
    });
    const end = () => { active = false; dm.classList.remove('is-drag'); };
    dm.addEventListener('pointerup', end);
    dm.addEventListener('pointercancel', end);
    dm.addEventListener('click', e => { if (moved) { e.preventDefault(); moved = false; } });
  }

  /* ---------- HUD: cambia a blanco cuando está sobre fondos de color ---------- */
  function hudWatch() {
    $$('.col, .tickets').forEach(e => (e.dataset.bg = 'dark'));
    const l = $('.hud--l'), r = $('.hud--r');
    if (!l || !r) return;
    let queued = false;
    const isDark = el => {
      for (let e = el; e && e !== root; e = e.parentElement) {
        if (e.dataset && e.dataset.bg) return e.dataset.bg === 'dark';
      }
      return false;
    };
    const check = () => {
      queued = false;
      const y = innerHeight - 22;
      l.classList.toggle('is-light', isDark(document.elementFromPoint(100, y)));
      r.classList.toggle('is-light', isDark(document.elementFromPoint(innerWidth - 100, y)));
    };
    const q = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    addEventListener('scroll', q, { passive: true });
    addEventListener('resize', q);
    q();
  }

  /* ---------- Teléfono de Aureo duplicado en la lista de trabajos ---------- */
  function clonePhone() {
    const phone = $('.slide--aureo .phone');
    const holder = $('.vis__phone');
    if (phone && holder && !holder.children.length) holder.appendChild(phone.cloneNode(true));
  }

  /* ==========================================================
     Movimiento (GSAP)
     ========================================================== */
  function initMotion() {
    const plugins = [ScrollTrigger];
    if (window.SplitText) plugins.push(SplitText);
    gsap.registerPlugin(...plugins);
    ScrollTrigger.config({ ignoreMobileResize: true, autoRefreshEvents: 'visibilitychange,DOMContentLoaded,load' });

    /* Scroll suave */
    let lenis = null;
    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    }
    window.portfolio = {
      lenis,
      scrollTo: y => (lenis ? lenis.scrollTo(y, { immediate: true, force: true }) : window.scrollTo(0, y)),
    };
    const go = t => {
      if (lenis) lenis.scrollTo(t, { duration: 1.4 });
      else if (t === 0) window.scrollTo({ top: 0, behavior: 'smooth' });
      else t.scrollIntoView({ behavior: 'smooth' });
    };
    $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#top') { e.preventDefault(); go(0); return; }
      const t = id.length > 1 ? $(id) : null;
      if (!t) return;
      e.preventDefault();
      go(t);
    }));

    ScrollTrigger.create({ start: 80, end: 'max', onToggle: s => root.classList.toggle('is-scrolled', s.isActive) });

    const mm = gsap.matchMedia();

    /* ----- Para todos los tamaños (con movimiento permitido) ----- */
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      /* Entrada: las letras suben, aparece la barra y el texto */
      const letters = $$('.wm--hero .wm__l > span');
      gsap.set(letters, { yPercent: 110 });
      gsap.timeline({ delay: 0.15 })
        .to(letters, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: 0.055 })
        .to('.bar', { autoAlpha: 1, duration: 0.8 }, '-=0.7')
        .fromTo('[data-intro]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.12 }, '-=0.6');

      /* El logotipo se encoge hasta la esquina y la barra sube */
      const hero = $('.wm--hero'), bar = $('.bar');
      const scaleTo = () => {
        const w = hero.offsetWidth;
        return Math.min(Math.max(w * 0.13, 120), 220) / w;
      };
      gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: root, start: 0, end: () => innerHeight * 0.5, scrub: true, invalidateOnRefresh: true },
      })
        .fromTo(hero, { scale: 1 }, { scale: scaleTo }, 0)
        .fromTo(bar, { y: () => hero.offsetHeight + 16 }, { y: 0 }, 0)
        .to('.bar__tag', { opacity: 0, ease: 'none', duration: 0.4 }, 0);

      /* El texto del inicio se desvanece para no chocar con el logotipo al encogerse */
      gsap.fromTo('.hero__lead, .hero__meta, .hero__scroll', { opacity: 1 }, {
        opacity: 0, ease: 'none', immediateRender: false,
        scrollTrigger: { trigger: root, start: 0, end: () => innerHeight * 0.3, scrub: true },
      });

      /* Fórmula: las palabras se separan hasta los bordes */
      gsap.fromTo('.eq', { width: '34%' }, {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: '.eqwrap', start: 'top 92%', end: 'top 35%', scrub: true },
      });

      /* Textos que se enfocan línea a línea con el scroll */
      $$('[data-reveal]').forEach(el => {
        if (window.SplitText) {
          SplitText.create(el, {
            type: 'lines', autoSplit: true,
            onSplit: self => gsap.fromTo(self.lines,
              { opacity: 0.08, filter: 'blur(12px)', y: 24 },
              { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.35,
                scrollTrigger: { trigger: el, start: 'top 90%', end: 'bottom 55%', scrub: true } }),
          });
        } else {
          gsap.from(el, { opacity: 0, y: 30, scrollTrigger: { trigger: el, start: 'top 88%' } });
        }
      });
      gsap.fromTo('[data-photo]', { filter: 'blur(18px)', opacity: 0.2, scale: 1.06 }, {
        filter: 'blur(0px)', opacity: 1, scale: 1, ease: 'none',
        scrollTrigger: { trigger: '[data-photo]', start: 'top 92%', end: 'top 50%', scrub: true },
      });
    });

    /* ----- Escritorio: secciones fijas con scroll ----- */
    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {

      /* Proyectos destacados: deslizamiento horizontal con desenfoque */
      {
        const sec = $('.showcase'), frame = $('.showcase__frame'), track = $('.showcase__track');
        const slides = $$('.slide', track);
        const dist = () => Math.max(0, track.scrollWidth - frame.clientWidth);
        const blur = () => {
          const fr = frame.getBoundingClientRect();
          const cx = fr.left + fr.width / 2;
          slides.forEach(s => {
            const r = s.getBoundingClientRect();
            const d = Math.abs(r.left + r.width / 2 - cx) / (fr.width * 0.5);
            const k = Math.min(1, Math.max(0, (d - 0.3) / 0.7));
            s.style.filter = k > 0.01 ? `blur(${(k * 12).toFixed(1)}px)` : 'none';
            s.style.opacity = (1 - k * 0.55).toFixed(2);
          });
        };
        gsap.to(track, {
          x: () => -dist(), ease: 'none',
          scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: true, invalidateOnRefresh: true, onUpdate: blur, onRefresh: blur },
        });
        const reset = () => slides.forEach(s => { s.style.filter = ''; s.style.opacity = ''; });
        return reset;
      }
    });

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {

      /* Proceso: las columnas suben y un polígono rueda hasta volverse círculo */
      {
        const sec = $('.process'), grid = $('.process__grid'), cols = $$('.col', grid), svg = $('.process__svg');
        const dash = $('#p-dash'), road = $('#p-road'), roll = $('#p-roll'), dot = $('#p-dot');
        const fr = [0.64, 0.44, 0.33, 0.27];
        const H = () => grid.clientHeight;
        const state = { p: 0 };
        const draw = () => {
          const W = grid.clientWidth, h = H();
          const p = state.p;
          svg.setAttribute('viewBox', `0 0 ${W} ${h}`);
          const dy = h * 0.35, ry = h * 0.515, r = ry - dy;
          dash.setAttribute('x1', 0); dash.setAttribute('x2', W);
          dash.setAttribute('y1', dy); dash.setAttribute('y2', dy);
          const amp = r * 0.38 * Math.pow(1 - p, 1.4);
          const lam = 140 * (1 - 0.55 * p);
          let d = '';
          for (let x = 0; x <= W; x += 4) {
            const y = ry - amp * Math.abs(Math.sin(Math.PI * x / lam));
            d += (x ? 'L' : 'M') + x.toFixed(1) + ',' + y.toFixed(1);
          }
          road.setAttribute('d', d);
          const c1 = cols[0].offsetLeft + cols[0].offsetWidth * 0.5;
          const c4 = cols[3].offsetLeft + cols[3].offsetWidth * 0.42;
          const cx = c1 + (c4 - c1) * p;
          const n = Math.round(5 + 43 * Math.pow(p, 0.85));
          const rot = (cx / r) * 0.9;
          let maxS = -1;
          for (let i = 0; i < n; i++) maxS = Math.max(maxS, Math.sin(rot + (i / n) * Math.PI * 2));
          const cy = ry - r * maxS;
          const pts = [];
          for (let i = 0; i < n; i++) {
            const a = rot + (i / n) * Math.PI * 2;
            pts.push((cx + Math.cos(a) * r).toFixed(1) + ',' + (cy + Math.sin(a) * r).toFixed(1));
          }
          roll.setAttribute('points', pts.join(' '));
          dot.setAttribute('cx', cx.toFixed(1)); dot.setAttribute('cy', cy.toFixed(1));
        };
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: sec, start: 'top top', end: () => '+=' + innerHeight * 2.2, pin: true, scrub: 0.6, invalidateOnRefresh: true, onRefresh: draw },
        });
        cols.forEach((c, i) => tl.fromTo(c, { height: () => H() * fr[i] }, { height: () => H(), ease: 'power2.inOut', duration: 0.7 }, i * 0.05));
        tl.to(state, { p: 1, duration: 1, onUpdate: draw }, 0);
        draw();
      }

      /* Trabajo seleccionado: la lista activa cambia con el scroll y al pasar el cursor */
      {
        const sec = $('.work'), items = $$('.work__item'), vis = $$('.vis');
        let cur = -1;
        const set = i => {
          if (i === cur) return;
          cur = i;
          items.forEach((it, k) => it.classList.toggle('is-active', k === i));
          vis.forEach((v, k) => v.classList.toggle('is-active', k === i));
        };
        ScrollTrigger.create({
          trigger: sec, start: 'top top', end: 'bottom bottom',
          onUpdate: s => set(Math.min(items.length - 1, Math.floor(s.progress * items.length))),
        });
        const enters = items.map((it, k) => {
          const f = () => set(k);
          it.addEventListener('mouseenter', f);
          return [it, f];
        });
        return () => enters.forEach(([it, f]) => it.removeEventListener('mouseenter', f));
      }
    });

    mm.add('(min-width: 900px) and (prefers-reduced-motion: no-preference)', () => {

      /* Cielo: el degradado sube mientras el texto se enfoca */
      {
        const pin = $('.sky__pin'), glow = $('.sky__glow'), text = $('[data-sky]');
        const end = () => '+=' + innerHeight * 1.5;
        gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: { trigger: pin, start: 'top top', end, pin: true, scrub: 0.6, onUpdate: s => { pin.dataset.bg = s.progress > 0.55 ? 'dark' : 'light'; } },
        }).fromTo(glow, { scale: 0.4 }, { scale: 3.6 }, 0);
        if (window.SplitText) {
          SplitText.create(text, {
            type: 'lines', autoSplit: true,
            onSplit: self => gsap.fromTo(self.lines,
              { opacity: 0.1, filter: 'blur(14px)', y: 30 },
              { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.3,
                scrollTrigger: { trigger: pin, start: 'top top', end, scrub: 0.6 } }),
          });
        }
      }

      /* Tickets: entran girando desde los lados */
      {
        const t = $$('.ticket');
        gsap.timeline({
          defaults: { ease: 'power3.out' },
          scrollTrigger: { trigger: '.tickets', start: 'top top', end: () => '+=' + innerHeight * 1.3, pin: true, scrub: 0.8 },
        })
          .from(t[0], { xPercent: -140, yPercent: 30, rotation: -16, duration: 1 }, 0)
          .from(t[1], { yPercent: 150, rotation: 7, duration: 1 }, 0.2)
          .from(t[2], { xPercent: 140, yPercent: 30, rotation: 16, duration: 1 }, 0.4)
          .from('.tickets .pill, .tickets__note', { autoAlpha: 0, y: 20, duration: 0.6 }, 0.7);
      }

      /* Computadora: se endereza y crece al llegar */
      gsap.fromTo('#crt', { rotation: -8, scale: 0.8, yPercent: 12 }, {
        rotation: 0, scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: '.crtzone', start: 'top 85%', end: 'top 15%', scrub: true },
      });
    });

    /* ----- Móvil: solo aparece el contenido con suavidad ----- */
    mm.add('(max-width: 899px) and (prefers-reduced-motion: no-preference)', () => {
      $$('.col, .ticket, .work__item, .slide').forEach(el => {
        gsap.from(el, { autoAlpha: 0, y: 28, duration: 0.8, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 90%' } });
      });
    });

    ScrollTrigger.refresh();
  }

  /* ---------- Arranque ---------- */
  let started = false;
  function start() {
    if (started) return;
    started = true;
    fitAll();
    morph();
    barcodes();
    windows();
    diamond();
    hudWatch();
    clonePhone();
    if (window.gsap && window.ScrollTrigger) initMotion();
    let lastW = innerWidth, t;
    addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        if (innerWidth === lastW) return;
        lastW = innerWidth;
        fitAll();
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      }, 150);
    });
  }
  const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(r => setTimeout(r, 2000))]).then(start);
})();
