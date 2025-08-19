// Carrega conteúdo dinâmico de content.json e inicializa interações simples
(async function init() {
  const $ = (sel) => document.querySelector(sel);
  const byId = (id) => document.getElementById(id);

  // Helpers
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
  function renderIcon(val) {
    if (!val) return '<span>🔗</span>';
    const s = String(val).trim();
    // Se for um nome de ícone (ex.: "envelope" ou "bi-envelope"), usamos Bootstrap Icons
    const looksLikeBiName = s.startsWith('bi-') || s.startsWith('bi ')
      || /^[a-z0-9-]+$/i.test(s);
    if (looksLikeBiName) {
      const cls = s.startsWith('bi-') || s.startsWith('bi ')
        ? s
        : `bi-${s}`;
      return `<i class="bi ${cls}" aria-hidden="true"></i>`;
    }
    // Caso contrário tratamos como emoji/texto literal
    return `<span>${escapeHtml(s)}</span>`;
  }

  // Tema salvo
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  const themeToggleEl = byId('themeToggle');
  // refletir estado atual no aria-pressed
  themeToggleEl.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'light' ? 'true' : 'false');

  themeToggleEl.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const nextIsLight = !isLight;
    document.documentElement.setAttribute('data-theme', nextIsLight ? 'light' : '');
    localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
    themeToggleEl.setAttribute('aria-pressed', nextIsLight ? 'true' : 'false');
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

  
    // Squads
    if (Array.isArray(data.squads)) {
      const root = byId('squadsList');
      root.innerHTML = data.squads.map(sq => `
        <article class="card">
          <h3>${sq.squad || ''} ${sq.projeto ? `• ${sq.projeto}` : ''}</h3>
          ${sq.descricao ? `<p class="meta">${sq.descricao}</p>` : ''}
        </article>
      `).join('');
    }

    // Galeria/Projetos
    if (Array.isArray(data.projetos)) {
      const root = byId('gallery');
      root.innerHTML = data.projetos.map(p => `
        <figure class="tile">
          <img src="${p.imagem}" alt="${p.titulo || 'Imagem do projeto'}" loading="lazy" onerror="this.style.display='none'"/>
          <figcaption class="tile-caption">
            <div class="tile-row">
              <span class="tile-title">${p.titulo || ''}</span>
              ${p.link ? `\u003ca class='btn primary small' href='${p.link}' target='_blank' rel='noopener' aria-label='Ver projeto: ${p.titulo || 'projeto'}'\u003eVer\u003c/a\u003e` : ''}

            </div>
          </figcaption>
        </figure>
      `).join('');
    }

    // Contatos
    if (Array.isArray(data.contatos)) {
      const root = byId('contactLinks');
      root.innerHTML = data.contatos.map(c => `
        <div class="contact">
          ${renderIcon(c.icone)}
          <a href="${c.url}" target="_blank" rel="noopener">${c.label}</a>
          
        </div>
      `).join('');
    }

    // Curso (opcional via content.json)
    if (data.curso) {
      if (data.curso.descricao) byId('cursoDescricao').textContent = data.curso.descricao;

      // Link do curso (botão e banner)
      const linkEl = byId('cursoLink');
      const bannerLinkEl = byId('cursoBannerLink');
      if (data.curso.url) {
        linkEl.href = data.curso.url;
        if (bannerLinkEl) bannerLinkEl.href = data.curso.url;
      }
      if (data.curso.titulo) linkEl.textContent = data.curso.titulo;

      // Banner do curso
      const bannerImg = byId('cursoBanner');
      if (bannerImg && data.curso.banner) {
        bannerImg.src = data.curso.banner;
        if (data.curso.bannerAlt) bannerImg.alt = data.curso.bannerAlt;
        bannerImg.style.display = 'block';
      }
    }

    // GA4 - clicks em Contatos
    document.getElementById('contactLinks').addEventListener('click', function(event) {
      const link = event.target.closest('a');
      if (link) {
        const label = link.textContent.trim();
        const url = link.href;
    
        // Dispara evento no GA4
        gtag('event', 'clique_contato', {
          tipo: label,  // Ex: "E-mail", "LinkedIn"
          link: url     // Ex: "https://linkedin.com/in/..."
        });
    
        console.log(`Evento GA4 enviado: ${label} -> ${url}`);
      }
    });

    // GA4 - click no Curso (botão e banner)
    const cursoLinkEl = document.getElementById('cursoLink');
    if (cursoLinkEl) {
      cursoLinkEl.addEventListener('click', function() {
        const url = this.href;
        gtag('event', 'clique_curso', { link: url, origem: 'botao' });
        console.log(`Evento GA4 enviado: curso (botao) -> ${url}`);
      });
    }
    const cursoBannerLinkEl = document.getElementById('cursoBannerLink');
    if (cursoBannerLinkEl) {
      cursoBannerLinkEl.addEventListener('click', function() {
        const url = this.href;
        gtag('event', 'clique_curso', { link: url, origem: 'banner' });
        console.log(`Evento GA4 enviado: curso (banner) -> ${url}`);
      });
    }
    
  } catch (e) {
    console.error('Falha ao carregar content.json', e);
    byId('sobreText').textContent = 'Bem-vindo! Edite o arquivo content.json para personalizar seu portfólio.';
  }
})();

