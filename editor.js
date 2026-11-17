(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const copy = value => JSON.parse(JSON.stringify(value));
  const original = copy(window.LINKTREE_DATA || { profile: {}, links: [] });
  const draftKey = 'central-links-draft:' + location.pathname.replace(/editor\.html$/, '');
  let data = copy(original);

  try {
    const saved = localStorage.getItem(draftKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.profile && Array.isArray(parsed.links)) data = parsed;
    }
  } catch (_) { /* armazenamento pode estar indisponível */ }

  function ensureShape() {
    if (!data.profile || typeof data.profile !== 'object') data.profile = {};
    if (!Array.isArray(data.links)) data.links = [];
  }
  ensureShape();
  function persist() {
    try { localStorage.setItem(draftKey, JSON.stringify(data)); } catch (_) { /* opcional */ }
    $('saveState').textContent = 'Rascunho salvo neste navegador. Para publicar, baixe o site.js.';
  }
  function textOr(value, fallback) { return typeof value === 'string' && value.trim() ? value.trim() : fallback; }
  function validPhoto(value) { try { const u = new URL(value || ''); return ['https:', 'http:'].includes(u.protocol) ? u.href : null; } catch (_) { return null; } }
  function refreshProfileFields() {
    document.querySelectorAll('[data-profile]').forEach(field => {
      const key = field.dataset.profile;
      field.value = data.profile[key] || (key === 'accent' ? '#c6f68d' : '');
    });
  }
  function node(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function field(label, key, value, options = {}) {
    const holder = node('label', 'link-field' + (options.wide ? ' wide' : ''));
    holder.appendChild(node('span', '', label));
    const input = document.createElement('input');
    input.type = 'text';
    input.dataset.field = key;
    input.value = String(value ?? '');
    input.placeholder = options.placeholder || '';
    holder.appendChild(input);
    return holder;
  }
  function toggle(label, key, value) {
    const holder = node('label', 'toggle');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = value !== false;
    checkbox.dataset.field = key;
    holder.append(checkbox, node('span', '', label));
    return holder;
  }
  function actionButton(label, action, disabled) {
    const btn = node('button', action === 'remove' ? 'delete' : '', label);
    btn.type = 'button';
    btn.dataset.action = action;
    btn.disabled = !!disabled;
    return btn;
  }
  function drawEditor() {
    $('editList').replaceChildren();
    $('totalLinks').textContent = String(data.links.length);
    data.links.forEach((link, index) => {
      const detail = document.createElement('details');
      detail.className = 'link-edit';
      detail.dataset.index = index;
      if (link._open) detail.open = true;
      const summary = document.createElement('summary');
      summary.appendChild(node('span', 'summary-icon', link.icon || '🔗'));
      const labels = node('span', 'summary-labels');
      labels.append(node('strong', '', textOr(link.title, `Link ${index + 1}`)), node('small', '', link.enabled === false ? 'Desativado' : textOr(link.category, 'Sem categoria')));
      summary.appendChild(labels);
      detail.appendChild(summary);

      const body = node('div', 'edit-body');
      const fields = node('div', 'link-fields');
      fields.append(
        field('Título do botão', 'title', link.title, { placeholder: 'Meu site' }),
        field('Emoji / ícone', 'icon', link.icon, { placeholder: '🔗' }),
        field('Endereço do link', 'url', link.url, { wide: true, placeholder: 'https://...' }),
        field('Descrição (opcional)', 'description', link.description, { wide: true, placeholder: 'Uma frase curta sobre este link' }),
        field('Categoria (opcional)', 'category', link.category, { wide: true, placeholder: 'Projetos, Contatos, Redes...' })
      );
      const toggles = node('div', 'toggles');
      toggles.append(toggle('Exibir no site', 'enabled', link.enabled), toggle('Destacar botão', 'featured', link.featured === true));
      toggles.lastChild.querySelector('input').checked = link.featured === true;
      const actions = node('div', 'edit-actions');
      actions.append(actionButton('↑ Subir', 'up', index === 0), actionButton('↓ Descer', 'down', index === data.links.length - 1), actionButton('Excluir', 'remove'));
      body.append(fields, toggles, actions);
      detail.appendChild(body);
      $('editList').appendChild(detail);
    });
  }
  function updatePreview() {
    const p = data.profile;
    const color = /^#[\da-fA-F]{6}$/.test(p.accent || '') ? p.accent : '#c6f68d';
    document.documentElement.style.setProperty('--accent', color);
    $('hexColor').textContent = color;
    $('previewName').textContent = textOr(p.name, 'Minha central de links');
    $('previewHandle').textContent = textOr(p.handle, '@links');
    $('previewBio').textContent = textOr(p.bio, 'Meus links em um só lugar.');
    $('previewFooter').textContent = textOr(p.footer, 'Obrigado pela visita!');
    const avatar = $('previewAvatar');
    avatar.textContent = textOr(p.symbol, '✦');
    const photo = validPhoto(p.avatar);
    if (photo) {
      const img = document.createElement('img');
      img.src = photo;
      img.alt = '';
      img.onerror = () => img.remove();
      avatar.appendChild(img);
    }
    const visible = data.links.filter(link => link.enabled !== false && /^(https?:\/\/|mailto:|tel:)/i.test((link.url || '').trim()));
    $('previewCount').textContent = String(visible.length);
    const wrapper = $('previewLinks');
    wrapper.replaceChildren();
    if (!visible.length) {
      wrapper.appendChild(node('p', 'preview-note', 'Nenhum link publicado ainda.'));
      return;
    }
    const groups = new Map();
    visible.forEach(link => {
      const cat = textOr(link.category, 'Meus links');
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(link);
    });
    groups.forEach((items, category) => {
      if (groups.size > 1 || category !== 'Meus links') wrapper.appendChild(node('div', 'mini-category', category));
      items.forEach(link => {
        const card = node('div', 'mini-card' + (link.featured ? ' featured' : ''));
        const label = node('div', 'mini-card-text');
        label.append(node('strong', '', textOr(link.title, 'Abrir link')), node('small', '', textOr(link.description, link.url || '')));
        card.append(node('div', 'mini-icon', textOr(link.icon, '🔗')), label, node('span', 'mini-card-arrow', '↗'));
        wrapper.appendChild(card);
      });
    });
  }
  function refresh() { drawEditor(); updatePreview(); }
  refreshProfileFields();
  refresh();

  document.querySelectorAll('[data-profile]').forEach(input => {
    input.addEventListener('input', () => {
      data.profile[input.dataset.profile] = input.value;
      updatePreview();
      persist();
    });
  });

  $('editList').addEventListener('input', event => {
    const input = event.target.closest('[data-field]');
    const detail = event.target.closest('[data-index]');
    if (!input || !detail) return;
    const link = data.links[Number(detail.dataset.index)];
    link[input.dataset.field] = input.type === 'checkbox' ? input.checked : input.value;
    const labels = detail.querySelector('.summary-labels');
    labels.querySelector('strong').textContent = textOr(link.title, 'Link sem título');
    labels.querySelector('small').textContent = link.enabled === false ? 'Desativado' : textOr(link.category, 'Sem categoria');
    detail.querySelector('.summary-icon').textContent = textOr(link.icon, '🔗');
    updatePreview();
    persist();
  });
  $('editList').addEventListener('toggle', event => {
    const detail = event.target;
    if (detail.matches && detail.matches('details[data-index]')) {
      const link = data.links[Number(detail.dataset.index)];
      if (link) link._open = detail.open;
    }
  }, true);
  $('editList').addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;
    const detail = button.closest('[data-index]');
    const index = Number(detail.dataset.index);
    const action = button.dataset.action;
    if (action === 'remove') {
      if (!confirm(`Excluir "${textOr(data.links[index].title, 'este link')}"?`)) return;
      data.links.splice(index, 1);
    } else {
      const other = action === 'up' ? index - 1 : index + 1;
      if (other < 0 || other >= data.links.length) return;
      [data.links[index], data.links[other]] = [data.links[other], data.links[index]];
    }
    refresh();
    persist();
  });
  $('addLink').addEventListener('click', () => {
    data.links.forEach(link => { link._open = false; });
    data.links.push({ id: `link-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, title: '', description: '', url: '', icon: '🔗', category: 'Meus links', featured: false, enabled: true, _open: true });
    refresh();
    persist();
    const newest = $('editList').lastElementChild;
    if (newest) { newest.scrollIntoView({ behavior: 'smooth', block: 'center' }); newest.querySelector('[data-field="title"]').focus({ preventScroll: true }); }
  });
  $('downloadButton').addEventListener('click', () => {
    const exportData = copy(data);
    exportData.links.forEach(link => delete link._open);
    const content = '/* Configuração do seu site. Use editor.html para editar visualmente. */\nwindow.LINKTREE_DATA = ' + JSON.stringify(exportData, null, 2) + ';\n';
    const url = URL.createObjectURL(new Blob([content], { type: 'application/javascript;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'site.js';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $('saveState').textContent = 'Arquivo baixado! Agora substitua data/site.js no GitHub para publicar.';
  });
  $('resetButton').addEventListener('click', () => {
    if (!confirm('Descartar o rascunho deste navegador e voltar à versão de site.js atualmente carregada?')) return;
    try { localStorage.removeItem(draftKey); } catch (_) { }
    data = copy(original);
    ensureShape();
    refreshProfileFields();
    refresh();
    $('saveState').textContent = 'Rascunho descartado. Exibindo a versão carregada de site.js.';
  });
})();
