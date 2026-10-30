/* Caso de estudio: scroll suave, entradas y revelados con GSAP */
(() => {
  'use strict';
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fmt = new Intl.DateTimeFormat('es-CO', { timeZone: 'America/Bogota', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => $$('[data-clock]').forEach(e => (e.textContent = fmt.format(new Date()) + ' (COT)'));
  tick(); setInterval(tick, 1000);


  // Proceso: se abre un paso a la vez
  document.querySelectorAll('.kc__acc details').forEach(d => d.addEventListener('toggle', () => {
    if (d.open) document.querySelectorAll('.kc__acc details[open]').forEach(o => { if (o !== d) o.removeAttribute('open'); });
    if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 60);
  }));

  const gs = window.gsap, ST = window.ScrollTrigger;
  if (reduce || !gs || !ST) return;
  gs.registerPlugin(ST, ...(window.SplitText ? [SplitText] : []));

  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ST.update);
    gs.ticker.add(t => lenis.raf(t * 1000));
    gs.ticker.lagSmoothing(0);
  }

  // Entrada del encabezado del caso
  gs.fromTo('[data-intro]', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.1 });

  // Títulos y textos: se enfocan al llegar
  $$('[data-reveal]').forEach(el => {
    if (window.SplitText) {
      SplitText.create(el, {
        type: 'lines', autoSplit: true,
        onSplit: self => gs.fromTo(self.lines,
          { opacity: 0.1, filter: 'blur(10px)', y: 20 },
          { opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none', stagger: 0.25,
            scrollTrigger: { trigger: el, start: 'top 92%', end: 'bottom 62%', scrub: true } }),
      });
    }
  });

  // Bloques de texto: suben y aparecen
  $$('[data-rise]').forEach(el => {
    const items = el.querySelectorAll(':scope > ul > li, :scope > article, :scope > li, :scope > blockquote, :scope > section, :scope .cards > article, :scope .tree__cols > section, :scope .persona__id, :scope .persona__body > article, :scope .kws li, :scope > div, :scope .tree__root');
    const t = items.length ? items : [el];
    gs.fromTo(t, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });

  // Imágenes: salen del desenfoque
  $$('[data-img]').forEach(el => {
    gs.fromTo(el, { opacity: 0.15, filter: 'blur(14px)', y: 40 }, {
      opacity: 1, filter: 'blur(0px)', y: 0, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top 95%', end: 'top 60%', scrub: true },
    });
  });
})();
