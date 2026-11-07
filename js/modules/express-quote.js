/**
 * CN ConnectEC — express-quote.js
 * Cotizador express: captura leads y los registra en la API.
 */

const ExpressQuote = (() => {

  async function submitQuote(data) {
    // Try the API first
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return { ok: true };
      throw new Error('API error');
    } catch {
      // Offline fallback: store in localStorage
      const pending = JSON.parse(localStorage.getItem('cn_pending_quotes') || '[]');
      pending.push(data);
      localStorage.setItem('cn_pending_quotes', JSON.stringify(pending));
      return { ok: true, offline: true };
    }
  }

  function init() {
    const form = document.getElementById('quote-form');
    if (!form) return;

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const btn = form.querySelector('[type="submit"]');
      const originalText = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

      const formData = new FormData(form);
      const data = {
        id: 'quote-' + Date.now(),
        name:        formData.get('name')?.trim(),
        phone:       '+593' + (formData.get('phone') || '').replace(/\D/g, ''),
        category:    formData.get('category'),
        description: formData.get('description')?.trim(),
        zone:        formData.get('zone'),
        status:      'pending',
        createdAt:   new Date().toISOString(),
      };

      // Basic validation
      if (!data.name || !data.phone || !data.category || !data.description) {
        Toast.warning('Campos incompletos', 'Por favor completa todos los campos requeridos.');
        btn.disabled = false;
        btn.innerHTML = originalText;
        return;
      }

      const result = await submitQuote(data);

      btn.disabled = false;
      btn.innerHTML = originalText;

      if (result.ok) {
        Toast.success(
          '¡Cotización enviada!',
          'Recibirás respuesta vía WhatsApp en breve. ¡Gracias por confiar en CN ConnectEC!'
        );
        form.reset();
      } else {
        Toast.error('Error al enviar', 'Intenta nuevamente en un momento.');
      }
    });
  }

  return { init };
})();
