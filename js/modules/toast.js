/**
 * CN ConnectEC — toast.js
 * Sistema de notificaciones toast.
 */

const Toast = (() => {
  let container = null;

  function getContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'toast-container';
        document.body.appendChild(container);
      }
    }
    return container;
  }

  /**
   * @param {Object} opts
   * @param {'success'|'error'|'info'|'warning'} opts.type
   * @param {string} opts.title
   * @param {string} [opts.message]
   * @param {number} [opts.duration=4000]
   */
  function show({ type = 'info', title, message = '', duration = 4000 }) {
    const c = getContainer();

    const icons = {
      success: 'fa-circle-check',
      error:   'fa-circle-xmark',
      info:    'fa-circle-info',
      warning: 'fa-triangle-exclamation',
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    toast.innerHTML = `
      <i class="fa-solid ${icons[type]} toast__icon"></i>
      <div class="toast__body">
        <div class="toast__title">${title}</div>
        ${message ? `<div class="toast__msg">${message}</div>` : ''}
      </div>
      <button class="toast__close" aria-label="Cerrar notificación">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;

    c.appendChild(toast);

    // Close button
    toast.querySelector('.toast__close').addEventListener('click', () => dismiss(toast));

    // Auto dismiss
    const timer = setTimeout(() => dismiss(toast), duration);

    // Pause on hover
    toast.addEventListener('mouseenter', () => clearTimeout(timer));
    toast.addEventListener('mouseleave', () => setTimeout(() => dismiss(toast), 1500));

    return toast;
  }

  function dismiss(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-exit');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }

  return {
    success: (title, message, duration) => show({ type: 'success', title, message, duration }),
    error:   (title, message, duration) => show({ type: 'error',   title, message, duration }),
    info:    (title, message, duration) => show({ type: 'info',    title, message, duration }),
    warning: (title, message, duration) => show({ type: 'warning', title, message, duration }),
    show,
  };
})();
