/**
 * CN ConnectEC — search-filter.js
 * Buscador, filtros y renderizado de tarjetas de servicio.
 */

const SearchFilter = (() => {
  // ── Estado Global ──────────────────────────────────────────
  let allServices = [];
  let currentCategoryFilter = 'all';
  let currentZoneFilter     = 'all';
  let currentSearchTerm     = '';
  let debounceTimer         = null;

  // ── Helpers de WhatsApp ────────────────────────────────────
  function buildWhatsAppLink(phone, preset) {
    const clean   = phone.replace(/\D/g, '');
    const encoded = encodeURIComponent(preset);
    return `https://wa.me/${clean}?text=${encoded}`;
  }

  // ── Renderizado de chips de zona ───────────────────────────
  function renderZones(zones) {
    if (!zones || zones.length === 0) return '';
    const display = zones.slice(0, 3);
    const rest    = zones.length - display.length;
    let html = display.map(z => `<span class="zone-chip">${z}</span>`).join('');
    if (rest > 0) html += `<span class="zone-chip">+${rest} más</span>`;
    return html;
  }

  // ── Renderizado de features ────────────────────────────────
  function renderFeatures(features) {
    return features.map(f => `
      <div class="feature-item">
        <i class="fa-solid fa-check-circle"></i>
        <span>${f}</span>
      </div>
    `).join('');
  }

  // ── Render de una tarjeta ──────────────────────────────────
  function renderCard(service) {
    const waLink = buildWhatsAppLink(service.whatsappPhone, service.whatsappPreset);

    return `
      <article class="service-card animate-fade-in-up" data-category="${service.category}" data-id="${service.id}" style="--category-color:${Categories.color(service.category)}">
        <div class="service-card__image-wrap">
          <img
            class="service-card__image"
            src="${service.image}"
            alt="${service.title}"
            width="1200"
            height="675"
            loading="lazy"
            decoding="async"
          >
          ${service.badge && service.badge !== 'none' ? `
          <div class="service-card__badge">
            <span class="badge ${service.badgeColor}">
              <i class="fa-solid fa-shield-halved" style="font-size:0.6rem"></i>
              ${service.badge}
            </span>
          </div>` : ''}
        </div>

        <div class="service-card__body">
          <h3 class="service-card__title">${service.title}</h3>

          <div class="service-card__provider">
            <i class="fa-solid fa-circle-check service-card__provider-icon"></i>
            <span>${service.provider}</span>
          </div>

          <div class="service-card__meta">
            <span class="service-card__price">${service.priceNote}</span>
          </div>

          <div class="service-card__zones">
            ${renderZones(service.zones)}
          </div>

          <p class="service-card__description">${service.description}</p>

          <div class="service-card__features">
            ${renderFeatures(service.features)}
          </div>
        </div>

        <div class="service-card__actions">
          <a
            href="${waLink}"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-wa btn-ripple"
            aria-label="Consultar ${service.title} por WhatsApp"
          >
            <i class="fa-brands fa-whatsapp"></i>
            Consultar por WhatsApp
          </a>
          <button
            class="btn btn-outline btn-details"
            data-service-id="${service.id}"
            aria-label="Ver detalles de ${service.title}"
          >
            Ver detalles
          </button>
        </div>
      </article>
    `;
  }

  // ── Render de estado vacío ─────────────────────────────────
  function renderEmpty(term) {
    return `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-state__icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <p class="empty-state__title">Sin resultados</p>
        <p class="empty-state__text">
          No encontramos servicios${term ? ` para "<strong>${term}</strong>"` : ''} con los filtros actuales.
          <br>Intenta cambiar la categoría, zona o buscar con otro término.
        </p>
        <button
          class="btn btn-primary"
          onclick="SearchFilter.resetFilters()"
          style="margin-top:0.5rem"
        >
          <i class="fa-solid fa-rotate-left"></i> Limpiar filtros
        </button>
      </div>
    `;
  }

  // ── Lógica de filtrado ─────────────────────────────────────
  function filterServices(services) {
    return services.filter(service => {
      if (!service.active) return false;

      if (currentCategoryFilter !== 'all' && service.category !== currentCategoryFilter) return false;

      if (currentZoneFilter !== 'all' && !service.zones.includes(currentZoneFilter)) return false;

      const term = currentSearchTerm.toLowerCase().trim();
      if (term) {
        const matchTitle    = service.title.toLowerCase().includes(term);
        const matchDesc     = service.description.toLowerCase().includes(term);
        const matchProvider = service.provider.toLowerCase().includes(term);
        const matchFeats    = service.features.some(f => f.toLowerCase().includes(term));
        if (!matchTitle && !matchDesc && !matchProvider && !matchFeats) return false;
      }

      return true;
    });
  }

  // ── Render al grid ─────────────────────────────────────────
  function renderGrid() {
    const grid = document.getElementById('services-grid');
    if (!grid) return;

    if (currentCategoryFilter !== 'all' && !Categories.find(currentCategoryFilter)) currentCategoryFilter = 'all';
    document.querySelectorAll('.cat-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.cat === currentCategoryFilter);
      chip.setAttribute('aria-pressed', String(chip.dataset.cat === currentCategoryFilter));
    });
    const filtered = filterServices(allServices);

    if (filtered.length === 0) {
      grid.innerHTML = renderEmpty(currentSearchTerm);
    } else {
      grid.innerHTML = filtered.map(renderCard).join('');
      // Re-attach detail button listeners
      grid.querySelectorAll('.btn-details').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.dataset.serviceId;
          const svc = allServices.find(s => s.id === id);
          if (svc) Modals.openServiceDetail(svc);
        });
      });
    }

    updateCategoryCounters();
  }

  // ── Actualizar contadores en chips ─────────────────────────
  function updateCategoryCounters() {
    const categories = ['all', ...Categories.all().map(c => c.id)];
    const activeServices = allServices.filter(s => s.active);

    categories.forEach(cat => {
      const chip = document.querySelector(`.cat-chip[data-cat="${cat}"]`);
      if (!chip) return;
      const countEl = chip.querySelector('.cat-chip__count');
      if (!countEl) return;

      let count;
      if (cat === 'all') {
        count = activeServices.length;
      } else {
        count = activeServices.filter(s => s.category === cat).length;
      }
      countEl.textContent = count;
    });
  }

  // ── Setters del estado ─────────────────────────────────────
  function setCategory(cat) {
    currentCategoryFilter = cat;
    // Update chip UI
    document.querySelectorAll('.cat-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.cat === cat);
      chip.setAttribute('aria-pressed', String(chip.dataset.cat === cat));
    });
    renderGrid();
    // Scroll to catalog on mobile
    scrollToCatalog();
  }

  function setZone(zone) {
    currentZoneFilter = zone;
    // Update zone pill label
    const pill = document.getElementById('zone-pill-label');
    if (pill) pill.textContent = zone === 'all' ? 'Toda Manta' : zone;
    renderGrid();
  }

  function setSearch(term) {
    currentSearchTerm = term;
    renderGrid();
    if (term) scrollToCatalog();
  }

  function scrollToCatalog() {
    const section = document.getElementById('servicios-populares');
    if (!section) return;
    // Only scroll if below hero
    const rect = section.getBoundingClientRect();
    if (rect.top < 0 || rect.top > window.innerHeight) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function resetFilters() {
    currentCategoryFilter = 'all';
    currentZoneFilter     = 'all';
    currentSearchTerm     = '';

    // Reset UI
    const searchInput = document.getElementById('hero-search-input');
    if (searchInput) searchInput.value = '';
    const catalogSearch = document.getElementById('catalog-search-input');
    if (catalogSearch) catalogSearch.value = '';

    document.querySelectorAll('.cat-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.cat === 'all')
    );
    setZone('all');

    renderGrid();
  }

  // ── Init ───────────────────────────────────────────────────
  function init(services) {
    allServices = services;
    renderGrid();

    // Delegación: funciona también después de refrescar el catálogo.
    document.addEventListener('click', e => {
      const control = e.target.closest('.cat-chip, .hero-cat-btn, [data-category-link]');
      if (!control) return;
      e.preventDefault();
      setCategory(control.dataset.cat || control.dataset.categoryLink);
    });

    // Hero search input
    const heroSearch = document.getElementById('hero-search-input');
    if (heroSearch) {
      heroSearch.addEventListener('input', e => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => setSearch(e.target.value), 300);
      });
    }

    // Hero search button
    const heroBtn = document.getElementById('hero-search-btn');
    if (heroBtn) {
      heroBtn.addEventListener('click', () => {
        const val = heroSearch ? heroSearch.value : '';
        setSearch(val);
        scrollToCatalog();
      });
    }

    // Hero zone selector
    const heroZone = document.getElementById('hero-zone-select');
    if (heroZone) {
      heroZone.addEventListener('change', e => setZone(e.target.value));
    }


  }

  // ── Public API ─────────────────────────────────────────────
  return {
    init,
    setCategory,
    setZone,
    setSearch,
    resetFilters,
    getFiltered: () => filterServices(allServices),
    renderGrid,
    buildWhatsAppLink,
  };
})();
