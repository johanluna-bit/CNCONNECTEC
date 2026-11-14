/**
 * CN ConnectEC — express-quote.js
 * Cotizador express: captura leads y los registra en la API.
 */

const ExpressQuote = (() => {

  function buildMessage(data) {
    return [
      `Hola, soy ${data.name}.`,
      `Quiero una cotización de: ${data.category}.`,
      `Zona: ${data.zone}.`,
      `Detalle: ${data.description}`,
      `Mi WhatsApp: ${data.phone}`,
    ].join('\n');
  }

  function submitQuote(data) {
    CNWhatsApp.open(buildMessage(data));
    return { ok: true };
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
      const catSel = form.querySelector('[name="category"]');
      const zoneSel = form.querySelector('[name="zone"]');
      const data = {
        id: 'quote-' + Date.now(),
        name:        formData.get('name')?.trim(),
        phone:       '+593' + (formData.get('phone') || '').replace(/\D/g, ''),
        category:    catSel?.selectedOptions?.[0]?.text?.trim() || formData.get('category'),
        description: formData.get('description')?.trim(),
        zone:        zoneSel?.selectedOptions?.[0]?.text?.trim() || formData.get('zone'),
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
          'Se abrió WhatsApp',
          'Envía el mensaje con tu solicitud para completarla.'
        );
        form.reset();
      } else {
        Toast.error('Error al enviar', 'Intenta nuevamente en un momento.');
      }
    });
  }

  return { init };
})();
