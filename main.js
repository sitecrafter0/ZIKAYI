// main.js — Premium interactions for ZIKAYI site
// Replace your existing main.js with this file.
// Author: ChatGPT (GPT-5 Thinking mini)
//
// Features:
// - Sticky header with scroll behavior (debounced)
// - Mobile nav (toggle + close on outside click + aria updates)
// - Smooth anchor scrolling
// - IntersectionObserver reveal animations with stagger support (data-animate & data-delay)
// - Portfolio modal (works if modal exists on page)
// - Hero video accessibility controls & fallback handling
// - Contact form submit: try fetch -> fallback to mailto, with UX messages
// - Lazyload helper for images/videos with data-src / loading="lazy" support
// - WhatsApp button small pulse effect
// - Defensive : works if elements are absent

(() => {
  'use strict';

  /* ============================
     Config
  ============================ */
  const config = {
    revealThreshold: 0.16,
    revealRootMargin: '0px 0px -12% 0px',
    revealClass: 'shown',
    scrollDebounceMs: 12,
    headerScrollOffset: 40,
    formEndpoint: '', // if you have a backend, paste URL here
    siteEmail: 'info@zikayi.co.za',
    whatsappNumber: '+27', // set full number with country code for WA button
  };

  /* ============================
     Utilities
  ============================ */
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const isVisible = el => !!(el && el.offsetParent !== null);

  // simple debounce
  function debounce(fn, wait = 20) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /* ============================
     STICKY HEADER
  ============================ */
  const header = $('#header') || $('header');
  function handleHeaderScroll() {
    if (!header) return;
    if (window.scrollY > config.headerScrollOffset) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  window.addEventListener('scroll', debounce(handleHeaderScroll, config.scrollDebounceMs));
  // initial
  handleHeaderScroll();

  /* ============================
     MOBILE NAV
  ============================ */
  const hamburger = document.getElementById('hamburger') || $('.hamburger');
  const navEl = document.querySelector('.nav') || $('nav');

  if (hamburger && navEl) {
    hamburger.setAttribute('role', 'button');
    hamburger.setAttribute('aria-label', 'Toggle navigation');
    hamburger.setAttribute('tabindex', '0');

    function openNav() {
      navEl.classList.add('open');
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // lock scroll when nav open on mobile
    }
    function closeNav() {
      navEl.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
    hamburger.addEventListener('click', () => {
      navEl.classList.contains('open') ? closeNav() : openNav();
    });

    // close nav when clicking outside
    document.addEventListener('click', (e) => {
      if (!navEl.contains(e.target) && !hamburger.contains(e.target) && navEl.classList.contains('open')) {
        closeNav();
      }
    });

    // keyboard toggle
    hamburger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navEl.classList.contains('open') ? closeNav() : openNav();
      } else if (e.key === 'Escape') {
        closeNav();
      }
    });
  }

  /* ============================
     SMOOTH SCROLL for anchor links
  ============================ */
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    // close mobile nav if open
    if (navEl && navEl.classList.contains('open') && typeof navEl.classList.remove === 'function') {
      navEl.classList.remove('open');
      hamburger && hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // set focus for accessibility
    setTimeout(() => {
      try { target.setAttribute('tabindex', '-1'); target.focus(); } catch (err) { /* ignore */ }
    }, 600);
  });

  /* ============================
     REVEAL ANIMATIONS (data-animate + data-delay)
     Elements should have attribute: data-animate="fade-up" etc.
  ============================ */
  const revealSelector = '[data-animate], .reveal';
  const revealEls = $$(revealSelector);

  if (revealEls.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          // delay from attribute or class like delay-1
          const delayAttr = el.getAttribute('data-delay');
          if (delayAttr) el.style.transitionDelay = (parseInt(delayAttr, 10) / 1000) + 's';
          // add class that triggers CSS transition
          el.classList.add(config.revealClass);
          observer.unobserve(el);
        }
      });
    }, { threshold: config.revealThreshold, rootMargin: config.revealRootMargin });

    revealEls.forEach((el, i) => {
      // if element already had a delay class like delay-1, convert to style for consistency
      if (!el.hasAttribute('data-delay')) {
        const delayCls = Array.from(el.classList).find(c => /^delay-/.test(c));
        if (delayCls) {
          const parts = delayCls.split('-');
          const n = parseFloat(parts[1]) || 0;
          el.style.transitionDelay = (n * 0.12) + 's';
        } else {
          // small stagger for natural feeling
          el.style.transitionDelay = (i * 0.06) + 's';
        }
      }
      observer.observe(el);
    });
  }

  /* ============================
     PORTFOLIO MODAL (if present)
  ============================ */
  const modal = document.getElementById('projectModal');
  if (modal) {
    const modalImg = modal.querySelector('#modalImg');
    const modalTitle = modal.querySelector('#modalTitle');
    const modalDesc = modal.querySelector('#modalDesc');
    const modalClose = modal.querySelector('.modal-close');

    function openModal({ img, title, desc, alt }) {
      if (modalImg) { modalImg.src = img || ''; modalImg.alt = alt || title || ''; }
      modalTitle && (modalTitle.textContent = title || '');
      modalDesc && (modalDesc.textContent = desc || '');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setTimeout(() => modal.classList.add('open'), 10);
    }
    function closeModal() {
      modal.classList.remove('open');
      modal.style.display = 'none';
      document.body.style.overflow = '';
      // cleanup image src to potentially free memory
      if (modalImg) modalImg.src = '';
    }

    // attach click handlers for project cards (defensive)
    $$('.project-card').forEach(card => {
      card.addEventListener('click', () => {
        const img = card.dataset.img || (card.querySelector('img') && card.querySelector('img').src);
        const title = card.dataset.title || card.querySelector('h3')?.innerText || '';
        const desc = card.dataset.desc || '';
        const alt = card.querySelector('img')?.alt || title;
        openModal({ img, title, desc, alt });
      });
    });

    // close actions
    modalClose && modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  /* ============================
     HERO VIDEO: ensure playable, add keyboard toggle for mute
  ============================ */
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    // If browser prevented autoplay, mute & try again (most are muted so autoplay works)
    heroVideo.addEventListener('error', () => {
      console.warn('Hero video failed to load');
    });
    // Pause/resume on visibility change to save CPU/battery
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        try { heroVideo.pause(); } catch (e) {}
      } else {
        try { heroVideo.play().catch(() => {}); } catch (e) {}
      }
    });
    // keyboard: space toggles play/pause when focus is within hero
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && document.activeElement === document.body) {
        // ignore if typing in input
        const isTyping = ['INPUT','TEXTAREA'].includes(document.activeElement?.tagName);
        if (!isTyping) {
          e.preventDefault();
          if (heroVideo.paused) heroVideo.play().catch(()=>{});
          else heroVideo.pause();
        }
      }
    });
  }

  /* ============================
     CONTACT FORM HANDLING
     - If config.formEndpoint present, POST JSON to it
     - Otherwise fallback to mailto when POST fails
     - Provide inline messages to user
  ============================ */
  (function wireContactForm() {
    const form = document.getElementById('contactform') || document.querySelector('.contact-form') || document.querySelector('form.contact-form');
    if (!form) return;

    // create message area if not present
    let msg = form.querySelector('.form-message');
    if (!msg) {
      msg = document.createElement('div');
      msg.className = 'form-message';
      msg.setAttribute('role', 'status');
      msg.style.marginTop = '12px';
      form.appendChild(msg);
    }

    const setMessage = (text, ok = true) => {
      msg.textContent = text;
      msg.style.color = ok ? config.primaryColor || '#0fa958' : '#b00020';
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // collect form data
      const fd = new FormData(form);
      const data = {};
      for (const [k, v] of fd.entries()) {
        data[k] = v;
      }

      // Basic client-side validation
      if (!data.name && form.querySelector('[name="name"]')) { setMessage('Please enter your name.', false); return; }
      if (!data.email && form.querySelector('[name="email"]')) { setMessage('Please enter your email.', false); return; }
      if (!data.message && form.querySelector('[name="message"]') && !form.querySelector('[name="message"]').value.trim()) { setMessage('Please add a message.', false); return; }

      setMessage('Sending — please wait...', true);

      // If endpoint configured, try POST
      if (config.formEndpoint) {
        try {
          const res = await fetch(config.formEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!res.ok) throw new Error('Network response not ok');
          setMessage('Thanks — your enquiry has been sent!', true);
          form.reset();
          return;
        } catch (err) {
          console.warn('Form POST failed, falling back to mailto:', err);
        }
      }

      // Fallback: open mail client using mailto (encode body)
      const name = data.name || data['full-name'] || '';
      const email = data.email || '';
      const phone = data.phone || data.tel || '';
      const service = data.service || data['project-type'] || '';
      const messageText = data.message || data['message'] || '';

      const subject = encodeURIComponent(`Project enquiry from ${name || email || 'website visitor'}`);
      const body = encodeURIComponent([
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: ${phone}`,
        `Service: ${service}`,
        '',
        'Message:',
        messageText
      ].join('\n'));

      // small UX pause then open
      setTimeout(() => {
        window.location.href = `mailto:${config.siteEmail}?subject=${subject}&body=${body}`;
        setMessage('Opening your email client...', true);
        form.reset();
      }, 700);
    });
  })();

  /* ============================
     LAZY LOADING for images/videos with data-src
     - Elements: <img data-src="..." /> or <video data-src="...">
  ============================ */
  (function lazyLoad() {
    const lazyEls = $$('img[data-src], video[data-src]');
    if (!lazyEls.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const src = el.dataset.src;
        if (!src) { observer.unobserve(el); return; }
        if (el.tagName === 'IMG') {
          el.src = src;
          el.removeAttribute('data-src');
        } else if (el.tagName === 'VIDEO') {
          // assume <source> child exists
          const source = el.querySelector('source');
          if (source) {
            source.src = src;
            el.load();
            el.removeAttribute('data-src');
          } else {
            el.src = src;
          }
        }
        observer.unobserve(el);
      });
    }, { rootMargin: '200px 0px' });
    lazyEls.forEach(el => observer.observe(el));
  })();

  /* ============================
     WhatsApp button (small pulse micro-interaction)
  ============================ */
  (function whatsappPulse() {
    const wa = document.querySelector('.whatsapp-btn');
    if (!wa) return;
    // ensure correct href
    if (config.whatsappNumber && wa.href.indexOf('wa.me') === -1) {
      wa.href = `https://wa.me/${encodeURIComponent(config.whatsappNumber)}`;
    }
    // subtle pulse animation every 6s to draw attention
    let pulseTimer = setInterval(() => {
      if (!document.hidden) {
        wa.style.transform = 'scale(1.08)';
        setTimeout(() => { wa.style.transform = ''; }, 260);
      }
    }, 6000);
    // stop when clicked to prevent annoyance
    wa.addEventListener('click', () => clearInterval(pulseTimer));
  })();

  /* ============================
     Image/object fit fix for older browsers (progressive enhancement)
  ============================ */
  (function objectFitFallback() {
    // If browser supports object-fit, nothing to do
    if ('objectFit' in document.documentElement.style) return;
    // apply background-image fallback for imgs with .cover
    $$('img.cover').forEach(img => {
      const parent = img.parentElement;
      if (!parent) return;
      parent.style.backgroundImage = `url("${img.src}")`;
      parent.style.backgroundSize = 'cover';
      parent.style.backgroundPosition = 'center';
      img.style.display = 'none';
    });
  })();

  /* ============================
     Small accessibility & polish
  ============================ */
  // ensure external links open in new tabs safely
  $$('a[href]').forEach(a => {
    try {
      const href = a.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') && new URL(href).origin !== location.origin) {
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('target', '_blank');
      }
    } catch (err) { /* ignore malformed */ }
  });

  // expose small API for debugging in console if needed
  window._ZIK = {
    openModal: (opts) => {
      if (!modal) return console.warn('No modal on this page');
      modal.querySelector('#modalImg').src = opts.img || '';
      modal.querySelector('#modalTitle').textContent = opts.title || '';
      modal.querySelector('#modalDesc').textContent = opts.desc || '';
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      setTimeout(() => modal.classList.add('open'), 10);
    }
  };

  // finished init
  // small reveal for already-in-view elements (in case intersection observer misses)
  setTimeout(() => { $$('.reveal').forEach(el => { if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add(config.revealClass); }); }, 600);

})();
