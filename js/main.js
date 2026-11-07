/**
 * CN ConnectEC — main.js
 * Inicialización global, carga de servicios y event listeners.
 */

// ── Constantes globales ────────────────────────────────────────
const WS_CENTRAL = "+593XXXXXXXXX"; // ← REEMPLAZAR con número real de Manta

// ── Carga de servicios ─────────────────────────────────────────
async function loadServices() {
  try {
    const res = await fetch('/api/services?onlyActive=true');
    if (!res.ok) throw new Error('API unavailable');
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) throw new Error('Empty data');
    return data;
  } catch {
    console.info('[CN ConnectEC] Backend no disponible. Usando datos offline.');
    return typeof SERVICES_DATA !== 'undefined' ? SERVICES_DATA : [];
  }
}

// ── Cargar configuración del sitio ─────────────────────────────
async function loadSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error();
    const cfg = await res.json();
    // Update WA button in header with real phone
    if (cfg.whatsappPhone) {
      document.querySelectorAll('[data-wa-central]').forEach(el => {
        const phone   = cfg.whatsappPhone.replace(/\D/g, '');
        const preset  = encodeURIComponent('Hola, los contacto desde CN ConnectEC (Manta). Quiero más información.');
        el.href = `https://wa.me/${phone}?text=${preset}`;
      });
    }
  } catch {
    // Use hardcoded fallback
    const phone   = WS_CENTRAL.replace(/\D/g, '');
    const preset  = encodeURIComponent('Hola, los contacto desde CN ConnectEC (Manta). Quiero más información.');
    const waLink  = `https://wa.me/${phone}?text=${preset}`;
    document.querySelectorAll('[data-wa-central]').forEach(el => {
      el.href = waLink;
    });
  }
}

// ── Navbar mobile menu ─────────────────────────────────────────
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu   = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  // Close on link click
  menu.querySelectorAll('a, button').forEach(el => {
    el.addEventListener('click', () => {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('i').className = 'fa-solid fa-bars';
    });
  });

  // Auto-close on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1024 && menu.classList.contains('open')) {
      menu.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.querySelector('i').className = 'fa-solid fa-bars';
    }
  });
}

// ── Smooth scroll para nav links ───────────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── Sticky navbar shadow on scroll ────────────────────────────
function initNavbarScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 10) {
      navbar.style.boxShadow = '0 4px 24px rgba(13,33,103,0.15)';
    } else {
      navbar.style.boxShadow = '';
    }
  }, { passive: true });
}

// ── Lazy load animation on scroll ─────────────────────────────
function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-fade-in-up');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.step-card, .stat-card, .quote-card').forEach(el => {
    obs.observe(el);
  });
}

// ── Active nav link on scroll ──────────────────────────────────
function initActiveNavLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => obs.observe(s));
}

// ── Main init ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load settings (WA link etc.)
  await loadSettings();

  // 2. Load services and init search/filter
  await Categories.load();
  Categories.renderPublic();
  const services = await loadServices();
  if (typeof SearchFilter !== 'undefined') {
    SearchFilter.init(services);
  }

  // 3. Init modals
  if (typeof Modals !== 'undefined') {
    Modals.init();
  }

  // 4. Init cotizador express
  if (typeof ExpressQuote !== 'undefined') {
    ExpressQuote.init();
  }

  // 5. UI helpers
  initMobileMenu();
  initSmoothScroll();
  initNavbarScroll();
  initScrollAnimations();
  initActiveNavLinks();

  console.log('[CN ConnectEC] ✅ HUB Multiservicios iniciado.');
});

window.addEventListener('focus', async () => {
  await Categories.load();
  Categories.renderPublic();
  if (typeof SearchFilter !== 'undefined') SearchFilter.renderGrid();
});
