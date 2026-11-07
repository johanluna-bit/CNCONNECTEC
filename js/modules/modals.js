/**
 * CN ConnectEC — modals.js
 * Gestión de modales: zona, detalle de servicio, prestadores.
 */

const Modals = (() => {
  const ZONES = [
    'Toda Manta',
    'Manta Centro',
    'Los Esteros',
    'Tarqui',
    'Jocay',
    'Urbanizaciones',
  ];

  // ── Helpers ──────────────────────────────────────────────
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    el.addEventListener('click', (e) => {
      if (e.target === el) closeModal(id);
    }, { once: true });
  }

  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.add('hidden');
    });
    document.body.style.overflow = '';
  }

  // ── Zone Modal ───────────────────────────────────────────
  function openZoneModal() {
    const modal = document.getElementById('zone-modal');
    if (!modal) return;

    const list = modal.querySelector('#zone-list');
    if (list) {
      list.innerHTML = ZONES.map(z => `
        <button class="zone-option" data-zone="${z === 'Toda Manta' ? 'all' : z}" type="button">
          <span><i class="fa-solid fa-location-dot" style="color:var(--cn-cyan);margin-right:0.5rem"></i>${z}</span>
          <i class="fa-solid fa-chevron-right" style="color:#cbd5e1;font-size:0.75rem"></i>
        </button>
      `).join('');

      list.querySelectorAll('.zone-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const zone = btn.dataset.zone;
          SearchFilter.setZone(zone);
          closeModal('zone-modal');
          Toast.info(
            'Zona actualizada',
            zone === 'all' ? 'Mostrando servicios de toda Manta' : `Filtrando servicios en ${zone}`
          );
        });
      });
    }

    openModal('zone-modal');
  }

  // ── Render stars helper ───────────────────────────────────
  function renderStars(rating) {
    const full  = Math.floor(rating);
    const half  = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '';
    for (let i = 0; i < full;  i++) html += '<i class="fa-solid fa-star" style="color:#F59E0B"></i>';
    if (half)                        html += '<i class="fa-solid fa-star-half-stroke" style="color:#F59E0B"></i>';
    for (let i = 0; i < empty; i++) html += '<i class="fa-regular fa-star" style="color:#F59E0B"></i>';
    return html;
  }

  // ── Service Detail Modal ─────────────────────────────────
  function openServiceDetail(service) {
    const modal = document.getElementById('service-detail-modal');
    if (!modal) return;

    const waLink = SearchFilter.buildWhatsAppLink(service.whatsappPhone, service.whatsappPreset);

    const body = modal.querySelector('#service-detail-body');
    if (body) {
      body.innerHTML = `
        <img
          src="${service.image}"
          alt="${service.title}"
          class="service-detail-image"
          onerror="this.src='https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=800&q=80'"
        >

        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.75rem;margin-bottom:1rem">
          <span class="badge ${service.badgeColor}">
            <i class="fa-solid fa-shield-halved" style="font-size:0.6rem"></i>
            ${service.badge}
          </span>
          <span style="font-size:0.8125rem;color:var(--cn-text-muted)">
            <i class="fa-solid fa-tag" style="color:var(--cn-blue)"></i>
            ${service.categoryLabel}
          </span>
        </div>

        <h2 style="font-size:1.375rem;font-weight:800;color:var(--cn-navy);margin-bottom:0.5rem">${service.title}</h2>

        <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem">
          <i class="fa-solid fa-circle-check" style="color:var(--cn-success)"></i>
          <span style="font-size:0.9rem;font-weight:600;color:var(--cn-text-muted)">${service.provider}</span>
        </div>

        <div class="service-detail-rating" style="margin-bottom:1.25rem">
          ${renderStars(service.rating)}
          <strong style="color:var(--cn-navy)">${service.rating.toFixed(1)}</strong>
          <span style="color:var(--cn-text-muted);font-size:0.875rem">(${service.reviews} reseñas verificadas)</span>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;padding:0.875rem 1rem;background:rgba(21,101,192,0.07);border-radius:0.75rem;margin-bottom:1.25rem">
          <span style="font-size:0.875rem;color:var(--cn-text-muted)">
            <i class="fa-solid fa-dollar-sign" style="color:var(--cn-blue)"></i> Tarifa estimada
          </span>
          <strong style="color:var(--cn-blue);font-size:1rem">${service.priceNote}</strong>
        </div>

        <p style="font-size:0.9375rem;color:var(--cn-text-muted);line-height:1.7;margin-bottom:1.25rem">${service.description}</p>

        <h4 style="font-size:0.875rem;font-weight:700;color:var(--cn-navy);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em">
          <i class="fa-solid fa-list-check" style="color:var(--cn-cyan)"></i> Incluye
        </h4>
        <div class="service-detail-features" style="margin-bottom:1.25rem">
          ${service.features.map(f => `
            <div class="service-detail-feature">
              <i class="fa-solid fa-check-circle"></i>
              <span>${f}</span>
            </div>
          `).join('')}
        </div>

        <h4 style="font-size:0.875rem;font-weight:700;color:var(--cn-navy);margin-bottom:0.75rem;text-transform:uppercase;letter-spacing:0.05em">
          <i class="fa-solid fa-map-pin" style="color:var(--cn-cyan)"></i> Zonas de cobertura
        </h4>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem;margin-bottom:1.5rem">
          ${service.zones.map(z => `<span class="zone-chip">${z}</span>`).join('')}
        </div>

        <a
          href="${waLink}"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-wa btn-lg"
          style="width:100%;justify-content:center;font-size:1rem"
          aria-label="Contactar a ${service.provider} por WhatsApp"
        >
          <i class="fa-brands fa-whatsapp" style="font-size:1.25rem"></i>
          Consultar por WhatsApp
        </a>
      `;
    }

    // Update modal title
    const titleEl = modal.querySelector('#service-detail-title');
    if (titleEl) titleEl.textContent = 'Detalle del Servicio';

    openModal('service-detail-modal');
  }

  // ── Provider Application Modal ───────────────────────────
  function openProviderModal() {
    openModal('provider-modal');
  }

  // ── Init ─────────────────────────────────────────────────
  function init() {
    // Close buttons
    document.querySelectorAll('[data-modal-close]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.modalClose;
        if (target) closeModal(target);
        else closeAllModals();
      });
    });

    // ESC key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeAllModals();
    });

    // Zone pill triggers
    document.querySelectorAll('[data-open-zone-modal]').forEach(el => {
      el.addEventListener('click', openZoneModal);
    });

    // Provider modal triggers
    document.querySelectorAll('[data-open-provider-modal]').forEach(el => {
      el.addEventListener('click', openProviderModal);
    });

    // Provider form submission
    const providerForm = document.getElementById('provider-form');
    if (providerForm) {
      providerForm.addEventListener('submit', async e => {
        e.preventDefault();
        const formData = new FormData(providerForm);
        const data = Object.fromEntries(formData.entries());
        data.status = 'pending';
        data.createdAt = new Date().toISOString();

        try {
          const res = await fetch('/api/providers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
          });
          if (res.ok) {
            Toast.success('¡Postulación enviada!', 'Nos comunicaremos contigo pronto.');
            closeModal('provider-modal');
            providerForm.reset();
          } else {
            Toast.error('Error al enviar', 'Intenta nuevamente.');
          }
        } catch {
          Toast.success('¡Postulación enviada!', 'Gracias por tu interés. Te contactaremos pronto.');
          closeModal('provider-modal');
          providerForm.reset();
        }
      });
    }
  }

  return { init, openZoneModal, openServiceDetail, openProviderModal, closeModal, closeAllModals };
})();
