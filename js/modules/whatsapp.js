/**
 * CN ConnectEC — whatsapp.js
 * Abre WhatsApp con un mensaje prellenado. Funciona sin backend.
 */
const CNWhatsApp = (() => {
  const FALLBACK = '+593992316303';

  function phone() {
    try {
      if (typeof WS_CENTRAL !== 'undefined' && WS_CENTRAL) {
        return WS_CENTRAL.replace(/\D/g, '');
      }
    } catch { /* WS_CENTRAL aún no definido */ }
    return FALLBACK.replace(/\D/g, '');
  }

  function open(text) {
    const url = `https://wa.me/${phone()}?text=${encodeURIComponent(text)}`;
    const win = window.open(url, '_blank');
    if (win) {
      win.opener = null;
    } else {
      window.location.href = url;
    }
    return url;
  }

  return { open, phone };
})();
