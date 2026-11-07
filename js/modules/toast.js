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
    toast.querySelector('.toast__close').addEventListener('click', (e) => {
      e.stopPropagation();
      dismiss(toast);
    });

    // Auto dismiss, pausing on hover and keeping the remaining time
    if (duration > 0) {
      let remaining = duration;
      let startedAt = Date.now();

      const clearTimer = () => {
        if (toast._timer) {
          clearTimeout(toast._timer);
          toast._timer = null;
        }
      };

      const schedule = (ms) => {
        clearTimer();
        startedAt = Date.now();
        toast._timer = setTimeout(() => dismiss(toast), ms);
      };

      toast.addEventListener('mouseenter', () => {
        if (!toast._timer) return;
        remaining = Math.max(0, remaining - (Date.now() - startedAt));
        clearTimer();
      });

      toast.addEventListener('mouseleave', () => {
        if (toast.dataset.dismissed === '1') return;
        schedule(remaining > 0 ? remaining : 1500);
      });

      schedule(duration);
    }

    return toast;
  }

  function dismiss(toast) {
    if (!toast || toast.dataset.dismissed === '1') return;
    toast.dataset.dismissed = '1';

    if (toast._timer) {
      clearTimeout(toast._timer);
      toast._timer = null;
    }

    toast.classList.add('toast-exit');

    const remove = () => {
      if (toast.parentNode) toast.remove();
    };

    // Remove on the exit animation, with a fallback so the toast never sticks
    // if animations are disabled or the class is overridden by another rule.
    toast.addEventListener('animationend', (e) => {
      if (e.target === toast) remove();
    }, { once: true });
    setTimeout(remove, 450);
  }

  return {
    success: (title, message, duration) => show({ type: 'success', title, message, duration }),
    error:   (title, message, duration) => show({ type: 'error',   title, message, duration }),
    info:    (title, message, duration) => show({ type: 'info',    title, message, duration }),
    warning: (title, message, duration) => show({ type: 'warning', title, message, duration }),
    show,
  };
})();
