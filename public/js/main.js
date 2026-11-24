/* Vellora House — interactions
   One orchestrated moment (the shutters opening), then scroll-led storytelling:
   word-by-word story, widening arch, pinned corridor of suites, parallax and side reveals. */
(() => {
  const WHATSAPP = '919800000000'; // front desk number, digits only
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  document.querySelectorAll('[data-year]').forEach(el => (el.textContent = new Date().getFullYear()));

  /* ---------- smooth scroll ---------- */
  let lenis = null;
  if (!reduce && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    if (hasGsap) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  const scrollToEl = el => (lenis ? lenis.scrollTo(el, { offset: -70 }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }));

  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    closeDrawer();
    scrollToEl(target);
    // Pre-fill the booking intent when a suite/homestay link is used
    const pick = a.dataset.suite || (a.dataset.homestay && `${a.dataset.homestay} (estate homestay)`);
    if (pick) {
      bookerPick = pick;
      if (a.dataset.homestay) $('input[name="stay"][value="an estate homestay"]').checked = true;
      setTimeout(() => $('input[name="in"]').focus({ preventScroll: true }), 900);
    }
  }));

  /* ---------- nav ---------- */
  const nav = $('#nav');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > window.innerHeight * 0.6);
    nav.classList.toggle('is-hidden', y > lastY && y > window.innerHeight);
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('.nav__burger'), drawer = $('#drawer');
  function closeDrawer() { drawer.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  burger.addEventListener('click', () => {
    const open = drawer.hidden;
    drawer.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !drawer.hidden) closeDrawer(); });

  /* ---------- booking form → WhatsApp ---------- */
  let bookerPick = '';
  const form = $('[data-booker]');
  const inEl = $('input[name="in"]', form), outEl = $('input[name="out"]', form), note = $('.booker__note', form);
  const iso = d => d.toISOString().slice(0, 10);
  const today = new Date(); const tmr = new Date(Date.now() + 864e5);
  inEl.min = iso(today); outEl.min = iso(tmr);
  inEl.addEventListener('change', () => {
    const next = new Date(new Date(inEl.value).getTime() + 864e5);
    outEl.min = iso(next);
    if (!outEl.value || outEl.value <= inEl.value) outEl.value = iso(next);
  });
  const fmt = v => new Date(v + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!inEl.value || !outEl.value) { note.textContent = 'Choose your arrival and departure dates first.'; return; }
    if (outEl.value <= inEl.value) { note.textContent = 'Departure needs to be after arrival.'; return; }
    note.textContent = '';
    const stay = $('input[name="stay"]:checked', form).value;
    const guests = $('select[name="guests"]', form).value;
    const nights = Math.round((new Date(outEl.value) - new Date(inEl.value)) / 864e5);
    const msg = `Hello Vellora House, we'd like ${bookerPick || stay} from ${fmt(inEl.value)} to ${fmt(outEl.value)} (${nights} night${nights > 1 ? 's' : ''}) for ${guests} guest${guests === '1' ? '' : 's'}. Is it available?`;
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  });

  /* ---------- homestay tabs ---------- */
  $$('[data-tabs]').forEach(root => {
    const tabs = $$('[role="tab"]', root);
    const select = tab => {
      tabs.forEach(t => {
        const on = t === tab;
        t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1;
        const panel = $('#' + t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on && hasGsap && !reduce) {
          gsap.fromTo($('.hs__img img', panel), { scale: 1.12, clipPath: 'inset(0 0 0 100%)' }, { scale: 1, clipPath: 'inset(0 0 0 0%)', duration: 1, ease: 'power3.out' });
          gsap.fromTo($('.hs__copy', panel).children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: .06, duration: .6, ease: 'power2.out' });
        }
      });
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', e => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); select(n);
      });
    });
  });

  /* ---------- day / night compare ---------- */
  $$('[data-compare]').forEach(c => {
    const r = $('.compare__range', c);
    const set = v => c.style.setProperty('--pos', v + '%');
    r.addEventListener('input', () => set(r.value));
    if (hasGsap && !reduce) {
      // a gentle hint sweep the first time it scrolls into view
      ScrollTrigger.create({ trigger: c, start: 'top 70%', once: true, onEnter: () => {
        const o = { v: 50 };
        gsap.timeline().to(o, { v: 72, duration: .8, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 30, duration: 1, ease: 'power2.inOut', onUpdate: () => set(o.v) })
          .to(o, { v: 50, duration: .7, ease: 'power2.inOut', onUpdate: () => { set(o.v); r.value = o.v; } });
      } });
    }
  });

  /* ---------- word-split for the story paragraph ---------- */
  $$('[data-words]').forEach(p => {
    p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span>`).join(' ');
  });

  /* ---------- no GSAP / reduced motion: show everything, finish here ---------- */
  const shutters = $('.shutters');
  if (!hasGsap || reduce) {
    shutters.classList.add('is-gone');
    document.body.classList.remove('is-loading');
    $$('.story__big .w').forEach(w => (w.style.opacity = 1));
    $('.suites').classList.add('is-static');
    marqueeCss();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* ---------- opening: shutters swing open, title rises ---------- */
  const heroLines = $$('.hero__title .line > span');
  gsap.set(heroLines, { yPercent: 110 });
  gsap.set(['.hero__place', '.hero__lede', '.booker'], { y: 30, opacity: 0 });
  gsap.set('.hero__video', { scale: 1.18 });

  const open = () => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' }, onComplete: () => { shutters.classList.add('is-gone'); } });
    tl.to('.shutters__mark', { opacity: 0, y: -10, duration: .45, ease: 'power2.in' })
      .to('.shutter--l', { rotateY: -105, duration: 1.6 }, '-=.05')
      .to('.shutter--r', { rotateY: 105, duration: 1.6 }, '<')
      .to('.shutter', { opacity: 0, duration: .5 }, '-=.45')
      .add(() => document.body.classList.remove('is-loading'), '-=1.2')
      .to('.hero__video', { scale: 1, duration: 2.4, ease: 'power2.out' }, '-=1.5')
      .to(heroLines, { yPercent: 0, duration: 1.2, stagger: .12, ease: 'power4.out' }, '-=2')
      .to(['.hero__place', '.hero__lede', '.booker'], { y: 0, opacity: 1, duration: .9, stagger: .1, ease: 'power3.out' }, '-=1');
  };
  const vid = $('.hero__video');
  let opened = false;
  const go = () => { if (!opened) { opened = true; open(); } };
  if (vid.readyState >= 2) setTimeout(go, 500); else { vid.addEventListener('loadeddata', () => setTimeout(go, 300), { once: true }); setTimeout(go, 2600); }

  /* hero media drifts slower than the page */
  gsap.to('[data-hero-media]', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- story: words light up as you read ---------- */
  const words = $$('.story__big .w');
  ScrollTrigger.create({
    trigger: '.story__big', start: 'top 80%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.floor(s.progress * words.length); words.forEach((w, i) => (w.style.opacity = i <= n ? 1 : .18)); }
  });
  gsap.from('.facts div', { y: 24, opacity: 0, stagger: .08, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.facts', start: 'top 88%' } });

  /* arch widens from a narrow window to the full arch */
  gsap.fromTo('[data-arch]', { clipPath: 'inset(18% 32% 0% 32% round 999px 999px 0 0)' },
    { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 0 0)', ease: 'none', scrollTrigger: { trigger: '[data-arch]', start: 'top 90%', end: 'center 50%', scrub: true } });
  gsap.fromTo('[data-arch] img', { yPercent: -8 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '[data-arch]', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- suites: pinned horizontal corridor ---------- */
  const mm = gsap.matchMedia();
  mm.add('(min-width: 861px)', () => {
    const track = $('.suites__track');
    const dist = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -dist(), ease: 'none',
      scrollTrigger: { trigger: '.suites', pin: '.suites__pin', start: 'top top', end: () => '+=' + dist(), scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.to('.suites__progress span', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.suites', start: 'top top', end: () => '+=' + dist(), scrub: true } });
    $$('.suite').forEach(card => {
      gsap.fromTo($('.suite__img img', card), { scale: 1.25 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      gsap.from($('.suite__body', card), { y: 40, opacity: 0, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 85%' } });
    });
  });
  mm.add('(max-width: 860px)', () => {
    $('.suites').classList.add('is-static');
    return () => $('.suites').classList.remove('is-static');
  });

  /* ---------- line reveals for split headings outside the hero ---------- */
  $$('[data-split]').forEach(h => {
    if (h.closest('.hero')) return;
    gsap.from($$('.line > span', h), { yPercent: 110, duration: 1.1, stagger: .12, ease: 'power4.out', scrollTrigger: { trigger: h, start: 'top 85%' } });
  });

  /* ---------- side / up reveals ---------- */
  $$('[data-reveal]').forEach(el => {
    const dir = el.dataset.reveal;
    const from = dir === 'left' ? { x: -80 } : dir === 'right' ? { x: 80 } : { y: 70 };
    gsap.from(el, { ...from, opacity: 0, duration: 1.2, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 85%' } });
  });

  /* ---------- parallax ---------- */
  $$('[data-speed]').forEach(el => {
    const s = parseFloat(el.dataset.speed);
    gsap.fromTo(el, { yPercent: -s * 100 }, { yPercent: s * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('[data-speed-bg]').forEach(el => {
    gsap.fromTo(el, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* monsoon copy slides in from the left like weather coming over the ghats */
  gsap.from('.monsoon__copy > *', { x: -60, opacity: 0, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.monsoon', start: 'top 65%' } });
  gsap.from('.compare', { clipPath: 'inset(0 0 0 100% round 26px)', duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: '.compare', start: 'top 80%' } });
  gsap.from('.routes li', { x: 40, opacity: 0, stagger: .08, duration: .8, ease: 'power2.out', scrollTrigger: { trigger: '.routes', start: 'top 85%' } });

  /* ---------- gallery marquee that leans with scroll speed ---------- */
  const track = $('[data-marquee]');
  track.innerHTML += track.innerHTML; // duplicate for a seamless loop
  $$('img', track).slice(track.children.length / 2).forEach(i => { i.alt = ''; i.setAttribute('aria-hidden', 'true'); });
  const loop = gsap.to(track, { xPercent: -50, duration: 60, ease: 'none', repeat: -1 });
  ScrollTrigger.create({ trigger: '.gallery', start: 'top bottom', end: 'bottom top', onUpdate: s => {
    const v = gsap.utils.clamp(-3, 3, s.getVelocity() / 400);
    gsap.to(loop, { timeScale: 1 + Math.abs(v) * 2, duration: .3, overwrite: true });
    gsap.to(loop, { timeScale: 1, duration: 1.2, delay: .3 });
  } });
  track.addEventListener('mouseenter', () => gsap.to(loop, { timeScale: 0.15, duration: .6 }));
  track.addEventListener('mouseleave', () => gsap.to(loop, { timeScale: 1, duration: .6 }));

  function marqueeCss() {
    const t = $('[data-marquee]');
    t.style.overflowX = 'auto'; t.style.width = 'auto'; t.style.paddingInline = '4vw';
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
})();
