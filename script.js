// Carrega conteúdo dinâmico de content.json e inicializa interações simples
(async function init() {
  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  // Tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  byId('themeToggle').addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? '' : 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });

  byId('year').textContent = new Date().getFullYear();

  try {
    const res = await fetch('content.json', { cache: 'no-store' });
    const data = await res.json();

    // Hero
    if (data.hero?.photo) {
      const img = byId('profilePhoto');
      img.src = data.hero.photo;
      img.style.display = 'block';
    }

    // Sobre
    if (data.sobre?.texto) byId('sobreText').textContent = data.sobre.texto;
    if (Array.isArray(data.sobre?.skills)) {
      const ul = byId('skillsBadges');
      ul.innerHTML = data.sobre.skills.map(s => `<li>${s}</li>`).join('');
    }

    // Experiência
    if (Array.isArray(data.experiencia)) {
      const root = byId('expTimeline');
      root.innerHTML = data.experiencia.map(exp => `
        <article class="card">
          <h3>${exp.cargo} • ${exp.empresa}</h3>
          <div class="meta">${exp.inicio} – ${exp.fim || 'Atual'} • ${exp.local || ''}</div>
          ${Array.isArray(exp.responsabilidades) ? `<ul>${exp.responsabilidades.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
          ${exp.stack ? `<div class="meta">Stack: ${exp.stack.join(', ')}</div>` : ''}
        </article>
      `).join('');
    }

    // Galeria/Projetos
    if (Array.isArray(data.projetos)) {
      const root = byId('gallery');
      root.innerHTML = data.projetos.map(p => `
        <figure class="tile">
          <img src="${p.imagem}" alt="${p.titulo || 'Imagem do projeto'}" loading="lazy" onerror="this.style.display='none'"/>
          <figcaption class="tile-caption">${p.titulo || ''} ${p.link ? `• <a href='${p.link}' target='_blank' rel='noopener'>Ver</a>` : ''}</figcaption>
        </figure>
      `).join('');
    }

    // Contatos
    if (Array.isArray(data.contatos)) {
      const root = byId('contactLinks');
      root.innerHTML = data.contatos.map(c => `
        <div class="contact">
          <span>${c.icone || '🔗'}</span>
          <a href="${c.url}" target="_blank" rel="noopener">${c.label}</a>
        </div>
      `).join('');
    }
  } catch (e) {
    console.error('Falha ao carregar content.json', e);
    byId('sobreText').textContent = 'Bem-vindo! Edite o arquivo content.json para personalizar seu portfólio.';
  }
})();

