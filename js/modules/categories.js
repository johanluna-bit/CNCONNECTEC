/** Catálogo compartido: API pública con respaldo para hosting estático. */
const Categories = (() => {
  let items = [];
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  async function load() {
    try {
      const res = await fetch('/api/categories', { cache: 'no-store' });
      if (!res.ok) throw new Error('Categorías no disponibles');
      const data = await res.json();
      if (!Array.isArray(data)) throw new Error('Catálogo inválido');
      items = data;
    } catch {
      items = typeof CATEGORIES_DATA !== 'undefined' ? CATEGORIES_DATA : [];
    }
    return items;
  }
  const find = id => items.find(c => c.id === id);
  const label = id => find(id)?.label || id || '';
  const color = id => find(id)?.color || '#1565C0';
  function options(select, placeholder, value = '') {
    if (!select) return;
    const selected = select.value;
    select.innerHTML = `<option value="${escape(value)}">${escape(placeholder)}</option>` + items.map(c => `<option value="${escape(c.id)}">${escape(c.label)}</option>`).join('');
    if ([...select.options].some(option => option.value === selected)) select.value = selected;
  }
  function renderPublic() {
    const icon = c => `<i class="fa-solid ${escape(c.icon)}" style="color:${escape(c.color)}"></i>`;
    const hero = document.querySelector('.hero-cats');
    if (hero) hero.innerHTML = items.map(c => `<a href="#servicios-populares" class="hero-cat-btn" data-cat="${escape(c.id)}">${icon(c)} ${escape(c.label)}</a>`).join('');
    const chips = document.querySelector('.category-filters');
    if (chips) chips.innerHTML = '<button class="cat-chip active" data-cat="all" aria-pressed="true">Todas <span class="cat-chip__count">0</span></button>' + items.map(c => `<button class="cat-chip" data-cat="${escape(c.id)}" aria-pressed="false" style="--category-color:${escape(c.color)}">${icon(c)} ${escape(c.label)} <span class="cat-chip__count">0</span></button>`).join('');
    const footer = document.getElementById('footer-categories');
    if (footer) footer.innerHTML = '<h4>Categorías</h4>' + items.map(c => `<a href="#servicios-populares" class="footer-link" data-category-link="${escape(c.id)}">${icon(c)} ${escape(c.label)}</a>`).join('');
    options(document.getElementById('q-category'), 'Selecciona una categoría...');
    options(document.getElementById('p-category'), 'Selecciona una categoría...');
  }
  return { load, find, label, color, options, renderPublic, escape, all: () => items };
})();
