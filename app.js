(() => {
  'use strict';

  const data = window.LINKTREE_DATA || { profile: {}, links: [] };
  const profile = data.profile || {};
  const allLinks = Array.isArray(data.links) ? data.links : [];
  const $ = (id) => document.getElementById(id);
  const color = /^#[a-fA-F0-9]{6}$/.test(profile.accent || '') ? profile.accent : '#c6f68d';
  document.documentElement.style.setProperty('--accent', color);

  function validUrl(value) {
    if (typeof value !== 'string' || !value.trim()) return null;
    try {
      const url = new URL(value.trim());
      return ['https:', 'http:', 'mailto:', 'tel:'].includes(url.protocol) ? url.href : null;
    } catch (_) { return null; }
  }

  function setText(id, value, fallback) {
    $(id).textContent = typeof value === 'string' && value.trim() ? value.trim() : fallback;
  }

  setText('profileName', profile.name, 'Minha central de links');
  setText('profileHandle', profile.handle, '@links');
  setText('profileBio', profile.bio, 'Meus links em um só lugar.');
  setText('footerText', profile.footer, 'Todos os links em um só lugar.');
  document.title = `${$('profileName').textContent} • Links`;
  document.querySelector('meta[name="description"]').content = $('profileBio').textContent;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = $('profileBio').textContent;

  const avatar = $('avatar');
  avatar.textContent = profile.symbol || '✦';
  const avatarUrl = validUrl(profile.avatar);
  if (avatarUrl && /^https?:/.test(avatarUrl)) {
    const image = document.createElement('img');
    image.src = avatarUrl;
    image.alt = '';
    image.onerror = () => image.remove();
    avatar.appendChild(image);
  }

  const links = allLinks.filter(link => link && link.enabled !== false && validUrl(link.url));
  $('linksCount').textContent = `${links.length} ${links.length === 1 ? 'link' : 'links'}`;
  $('searchHolder').hidden = links.length <= 7;

  function renderCard(link) {
    const card = document.createElement('a');
    card.className = `link-card${link.featured ? ' featured' : ''}`;
    card.href = validUrl(link.url);
    if (/^https?:/.test(card.href)) {
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }

    const icon = document.createElement('span');
    icon.className = 'link-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = link.icon || '🔗';

    const details = document.createElement('span');
    details.className = 'link-details';
    const title = document.createElement('span');
    title.className = 'link-title';
    const titleText = document.createElement('span');
    titleText.textContent = link.title || 'Abrir link';
    title.appendChild(titleText);
    if (link.featured) {
      const badge = document.createElement('span');
      badge.className = 'featured-label';
      badge.textContent = 'Destaque';
      title.appendChild(badge);
    }
    details.appendChild(title);
    if (link.description) {
      const description = document.createElement('span');
      description.className = 'link-description';
      description.textContent = link.description;
      details.appendChild(description);
    }
    const arrow = document.createElement('span');
    arrow.className = 'link-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    card.append(icon, details, arrow);
    return card;
  }

  function render(query = '') {
    const q = query.toLocaleLowerCase('pt-BR').trim();
    const shown = links.filter(link => [link.title, link.description, link.category].join(' ').toLocaleLowerCase('pt-BR').includes(q));
    const container = $('linksContainer');
    container.replaceChildren();
    if (!shown.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = links.length ? 'Nenhum link encontrado. Tente outra palavra.' : 'Ainda não há links publicados. Volte em breve!';
      container.appendChild(empty);
      return;
    }
    const groups = new Map();
    shown.forEach(link => {
      const category = (link.category || 'Meus links').trim() || 'Meus links';
      if (!groups.has(category)) groups.set(category, []);
      groups.get(category).push(link);
    });
    const showHeadings = groups.size > 1 || [...groups.keys()][0] !== 'Meus links';
    groups.forEach((items, category) => {
      const section = document.createElement('section');
      section.className = 'link-section';
      if (showHeadings) {
        const heading = document.createElement('h3');
        heading.className = 'category-heading';
        heading.textContent = category;
        section.appendChild(heading);
      }
      items.forEach(link => section.appendChild(renderCard(link)));
      container.appendChild(section);
    });
  }
  render();
  $('searchInput').addEventListener('input', e => render(e.target.value));

  let toastTimer;
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
  }
  $('shareButton').addEventListener('click', async () => {
    const url = location.href.split('#')[0].split('?')[0];
    try {
      if (navigator.share) {
        await navigator.share({ title: document.title, url });
      } else if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        toast('Endereço copiado!');
      } else {
        prompt('Copie o endereço da página:', url);
      }
    } catch (error) {
      if (error && error.name !== 'AbortError') prompt('Copie o endereço da página:', url);
    }
  });
})();
