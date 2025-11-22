/* main.js — Complete Rewrite
   ------------------------------------------------------------
   Vanilla JS, no dependencies. Works with:
   - #hamburger (hamburger button)
   - #navMenu   (nav container)
   - #themeToggle (theme toggle button)
   - .hero .hero-video
   - [data-animate], .reveal, .reveal-up
   - .portfolio-item, .project-card (tilt + modal)
   - .project-modal (modal structure optional)
   - .contact-btn (pulse)
   ------------------------------------------------------------ */

(() => {
  'use strict';

  /* ---------------------------
     Helper utilities
  --------------------------- */
  const el = (sel, ctx = document) => ctx.querySelector(sel);
  const els = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const on = (target, ev, fn) => { if (!target) return; target.addEventListener(ev, fn); };

  /* ---------------------------
     TOAST (global)
  --------------------------- */
  function showToast(message = 'Done', ms = 2500) {
    let t = document.getElementById('site-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'site-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = message;
    t.classList.add('show');
    clearTimeout(t._hideTimer);
    t._hideTimer = setTimeout(() => t.classList.remove('show'), ms);
  }

  /* ---------------------------
     THEME (dark / light)
  --------------------------- */
  function initThemeToggle() {
    const toggle = el('#themeToggle') || el('.theme-toggle');
    if (!toggle) return;

    const applyStored = () => {
      const stored = localStorage.getItem('site-theme');
      if (stored === 'dark') document.body.classList.add('dark-mode');
      else document.body.classList.remove('dark-mode');
    };
    applyStored();

    on(toggle, 'click', () => {
      const active = document.body.classList.toggle('dark-mode');
      localStorage.setItem('site-theme', active ? 'dark' : 'light');
      showToast(active ? 'Dark mode enabled' : 'Light mode enabled', 1400);
    });
  }

  /* ---------------------------
     MOBILE NAV
  --------------------------- */
  function initMobileNav() {
    const toggle = document.getElementById('hamburger');
    const nav = document.getElementById('navMenu');

    if (!toggle || !nav) return;

    // ARIA
    toggle.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');

    const open = () => {
      nav.classList.add('open');
      toggle.classList.add('active');
      toggle.setAttribute('aria-expanded', 'true');
      nav.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
    };
    const close = () => {
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
      nav.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
    };

    on(toggle, 'click', (e) => {
      e.stopPropagation();
      if (nav.classList.contains('open')) close();
      else open();
    });

    // close when clicking any link inside nav
    els('#navMenu a').forEach(a => on(a, 'click', close));

    // close on escape or outside click
    on(document, 'keydown', (ev) => {
      if (ev.key === 'Escape' && nav.classList.contains('open')) close();
    });
    on(document, 'click', (ev) => {
      if (!nav.contains(ev.target) && !toggle.contains(ev.target) && nav.classList.contains('open')) close();
    });
  }

  /* ---------------------------
     HERO PARALLAX
  --------------------------- */
  function initHeroParallax() {
    const hero = el('.hero');
    const video = el('.hero-video');
    if (!hero || !video) return;

    let ticking = false;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const pct = rect.top / window.innerHeight;
      const y = Math.max(Math.min(pct * -25, 20), -20); // clamp
      video.style.transform = `translateY(${y}px) scale(1.03)`;
      ticking = false;
    };

    on(window, 'scroll', () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    });
    // initial
    update();
  }

  /* ---------------------------
     REVEAL ON SCROLL
  --------------------------- */
  function initReveal() {
    const items = els('[data-animate], .reveal, .reveal-up');
    if (!items.length || !('IntersectionObserver' in window)) {
      // fallback: show all
      items.forEach(i => i.classList.add('visible'));
      return;
    }

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          const d = parseInt(ent.target.dataset.delay || 0, 10);
          setTimeout(() => ent.target.classList.add('visible'), d);
          obs.unobserve(ent.target);
        }
      });
    }, { threshold: 0.12 });

    items.forEach(i => io.observe(i));
  }

  /* ---------------------------
     PORTFOLIO: TILT + MODAL
  --------------------------- */
  function initPortfolio() {
    // selectors: support both .portfolio-item and .project-card
    const cards = els('.portfolio-item, .project-card');
    const modal = el('.project-modal') || el('#projectModal');

    // Tilt hover
    cards.forEach(card => {
      // tilt only on pointer devices
      on(card, 'pointermove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -8}deg) rotateY(${px * 10}deg)`;
      });
      on(card, 'pointerleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)';
      });
    });

    if (!modal) return;

    const modalImg = modal.querySelector('#modalImg') || modal.querySelector('img');
    const modalTitle = modal.querySelector('#modalTitle');
    const modalDesc = modal.querySelector('#modalDesc');
    const closeBtn = modal.querySelector('.modal-close');

    const openModal = (imgSrc, titleText = '', descText = '') => {
      if (modalImg) modalImg.src = imgSrc || '';
      if (modalTitle) modalTitle.textContent = titleText || '';
      if (modalDesc) modalDesc.textContent = descText || '';
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (modalImg) modalImg.src = '';
    };

    // open modal when clicking cards
    cards.forEach(card => {
      on(card, 'click', () => {
        const img = card.dataset.img || card.querySelector('img')?.src || '';
        const title = card.dataset.title || card.querySelector('h3')?.innerText || '';
        const desc = card.dataset.desc || '';
        openModal(img, title, desc);
      });
    });

    on(closeBtn, 'click', closeModal);
    on(modal, 'click', (e) => { if (e.target === modal) closeModal(); });
    on(document, 'keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ---------------------------
     CONTACT BUTTON PULSE
  --------------------------- */
  function initContactPulse() {
    const buttons = els('.contact-btn');
    if (!buttons.length) return;
    buttons.forEach(btn => {
      let timer = setInterval(() => {
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 700);
      }, 6000);
      on(btn, 'click', () => {
        clearInterval(timer);
        btn.classList.remove('pulse');
      });
    });
  }

  /* ---------------------------
     INITIALIZE
  --------------------------- */
  function init() {
    try {
      initThemeToggle();
      initMobileNav();
      initHeroParallax();
      initReveal();
      initPortfolio();
      initContactPulse();

      // small entry animation
      setTimeout(() => document.body.classList.add('page-loaded'), 80);
      // debug
      // console.info('main.js initialized');
    } catch (err) {
      console.error('Initialization error in main.js', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
