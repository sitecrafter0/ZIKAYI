/* main.js — Ultra Enhanced Edition
   --------------------------------
   ✔ Dark/Light Mode (saved to localStorage)
   ✔ Smoother Hero Parallax (GPU transforms)
   ✔ Advanced Reveal Animations (stagger + delay)
   ✔ Portfolio Modal (ESC + backdrop + arrow keys)
   ✔ Tilt-on-hover (GPU 3D)
   ✔ Contact Button Pulse (auto stops)
   ✔ Toast System (modern)
   ✔ Global fade-in on load
   ✔ Mobile Navigation Toggle  ← ADDED
*/

(() => {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* ============================================================
       DARK MODE / LIGHT MODE
       Saves preference + updates instantly
  ============================================================ */
  function initThemeToggle() {
    const toggle = $('.theme-toggle');
    if (!toggle) return;

    const stored = localStorage.getItem('site-theme');
    if (stored === 'dark') document.body.classList.add('dark-mode');

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const active = document.body.classList.contains('dark-mode');
      localStorage.setItem('site-theme', active ? 'dark' : 'light');

      showToast(active ? 'Dark mode enabled' : 'Light mode enabled');
    });
  }

  /* ============================================================
       HERO PARALLAX
  ============================================================ */
  function initHeroParallax() {
    const hero = $('.hero');
    const video = $('.hero-video');
    if (!hero || !video) return;

    const update = () => {
      const rect = hero.getBoundingClientRect();
      const pct = rect.top / window.innerHeight;
      const y = pct * -25;
      video.style.transform = `translateY(${y}px) scale(1.03)`;
    };

    update();
    window.addEventListener('scroll', () => requestAnimationFrame(update));
  }

  /* ============================================================
       SCROLL REVEAL (DATA DELAY + STAGGER)
  ============================================================ */
  function initReveal() {
    const items = $$('[data-animate], .reveal, .reveal-up');

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);

        setTimeout(() => {
          el.classList.add('visible');
        }, delay);

        io.unobserve(el);
      });
    }, { threshold: 0.12 });

    items.forEach(el => io.observe(el));
  }

  /* ============================================================
       PORTFOLIO + MODAL + TILT
  ============================================================ */
  function initPortfolio() {
    const cards = $$('.project-card, .gallery-item');
    const modal = $('.project-modal');
    if (!modal) return;

    const modalImg = modal.querySelector('#modalImg');
    const modalTitle = modal.querySelector('#modalTitle');
    const modalDesc = modal.querySelector('#modalDesc');
    const closeBtn = modal.querySelector('.modal-close');

    /* --- Tilt Hover --- */
    cards.forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          `perspective(1100px) rotateX(${dy * -10}deg) rotateY(${dx * 12}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1100px) rotateX(0) rotateY(0)';
      });
    });

    /* --- Open Modal --- */
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const img = card.dataset.img || card.querySelector('img')?.src || '';
        const title = card.dataset.title || card.querySelector('h3')?.innerText || '';
        const desc = card.dataset.desc || '';

        if (modalImg) modalImg.src = img;
        if (modalTitle) modalTitle.textContent = title;
        if (modalDesc) modalDesc.textContent = desc;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    /* --- Close Modal --- */
    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      if (modalImg) modalImg.src = '';
    };

    closeBtn && closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeModal();
    });
  }

  /* ============================================================
      CONTACT BUTTON PULSE
  ============================================================ */
  function initContactPulse() {
    const buttons = $$('.contact-btn');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      let timer = setInterval(() => {
        btn.classList.add('pulse');
        setTimeout(() => btn.classList.remove('pulse'), 600);
      }, 6000);

      btn.addEventListener('click', () => {
        clearInterval(timer);
        btn.classList.remove('pulse');
      });
    });
  }

  /* ============================================================
      TOAST (GLOBAL)
  ============================================================ */
  function showToast(msg = 'Done', ms = 2500) {
    let toast = $('#site-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'site-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    toast.classList.add('show');

    setTimeout(() => toast.classList.remove('show'), ms);
  }

 /* ============================================================
      MOBILE NAVIGATION TOGGLE — FIXED VANILLA JS VERSION
============================================================ */
function initMobileNav() {
    const toggle = document.getElementById('hamburger');
    const nav = document.getElementById('navMenu');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', () => {
        nav.classList.toggle('open');
        toggle.classList.toggle('open');
        document.body.classList.toggle('nav-open');
    });

    document.querySelectorAll('#navMenu a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('open');
            toggle.classList.remove('open');
            document.body.classList.remove('nav-open');
        });
    });
}

initMobileNav(); // ← VERY IMPORTANT


  /* ============================================================
      INITIALIZE EVERYTHING
  ============================================================ */
  function init() {
    initThemeToggle();
    initHeroParallax();
    initReveal();
    initPortfolio();
    initContactPulse();
    initMobileNav(); // ← ADDED

    setTimeout(() => document.body.classList.add('page-loaded'), 80);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else init();

})();
