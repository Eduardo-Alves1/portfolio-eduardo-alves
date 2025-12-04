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

  // Idioma salvo
  const savedLang = localStorage.getItem('lang') || 'pt';
  let currentLang = savedLang;
  const langToggle = byId('langToggle');
  if (langToggle) langToggle.textContent = currentLang === 'pt' ? 'EN' : 'PT';

  byId('year').textContent = new Date().getFullYear();

  async function loadContent(lang) {
    const file = lang === 'en' ? 'content.en.json' : 'content.json';
    const res = await fetch(file, { cache: 'no-store' });
    return res.json();
  }

  function translateStatic(lang) {
    // navbar
    const nav = document.querySelector('.nav');
    if (nav) {
      const links = nav.querySelectorAll('a[href^="#"]');
      links.forEach((a) => {
        const href = a.getAttribute('href');
        if (lang === 'en') {
          if (href === '#sobre') a.textContent = 'About';
          if (href === '#experiencia') a.textContent = 'Experience';
          if (href === '#projetos') a.textContent = 'Projects';
          if (href === '#curso') a.textContent = 'Course';
          if (href === '#contato') a.textContent = 'Contact';
        } else {
          if (href === '#sobre') a.textContent = 'Sobre';
          if (href === '#experiencia') a.textContent = 'Experiência';
          if (href === '#projetos') a.textContent = 'Projetos';
          if (href === '#curso') a.textContent = 'Curso';
          if (href === '#contato') a.textContent = 'Contato';
        }
      });
    }
    // títulos de seção
    document.querySelector('#sobre h2').textContent = lang === 'en' ? 'About' : 'Sobre';
    document.querySelector('#experiencia h2').textContent = lang === 'en' ? 'Experience' : 'Experiência';
    document.querySelector('#squads h2').textContent = lang === 'en' ? 'Squad Experience' : 'Experiência em Squads';
    document.querySelector('#projetos h2').textContent = lang === 'en' ? 'Projects and Images' : 'Projetos e Imagens';
    document.querySelector('#curso h2').textContent = lang === 'en' ? 'Computer Course' : 'Curso de Informática';
    document.querySelector('#contato h2').textContent = lang === 'en' ? 'Contact' : 'Contato';
    // hero CTA
    const contactBtn = document.querySelector('.cta a[href="#contato"]');
    if (contactBtn) contactBtn.textContent = lang === 'en' ? 'Get in touch' : 'Entrar em contato';
    const seeProjects = Array.from(document.querySelectorAll('.cta a')).find(a => a.getAttribute('href') === '#projetos');
    if (seeProjects) seeProjects.textContent = lang === 'en' ? 'See projects' : 'Ver projetos';
    const cvBtn = document.getElementById('cvDownload');
    if (cvBtn) cvBtn.textContent = lang === 'en' ? 'Download CV' : 'Baixar CV';
    // curso botão
    const cursoBtn = document.getElementById('cursoLink');
    if (cursoBtn) cursoBtn.textContent = lang === 'en' ? 'Access the course' : 'Acessar o curso';
    // rodapé
    const footerP = document.querySelector('.site-footer p');
    if (footerP) footerP.innerHTML = (lang === 'en'
      ? '© <span id="year"></span> Eduardo Alves. All rights reserved.'
      : '© <span id="year"></span> Eduardo Alves. Todos os direitos reservados.');
    byId('year').textContent = new Date().getFullYear();
  }

  try {
    const data = await loadContent(currentLang);

    translateStatic(currentLang);

    // Hero
    if (data.hero?.photo) {
      const img = byId('profilePhoto');
      img.src = data.hero.photo;
      img.style.display = 'block';
    }

    // Sobre
    if (data.sobre?.texto) byId('sobreText').textContent = data.sobre.texto;
    const skillsInit = Array.isArray(data.skills)
      ? data.skills
      : (Array.isArray(data.sobre?.skills) ? data.sobre.skills : null);
    if (skillsInit) {
      const ul = byId('skillsBadges');
      ul.innerHTML = skillsInit.map(s => `<li>${s}</li>`).join('');
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
              ${p.link ? `\u003ca class='btn primary small' href='${p.link}' target='_blank' rel='noopener' aria-label='${currentLang === 'en' ? 'View project' : 'Ver projeto'}: ${p.titulo || (currentLang === 'en' ? 'project' : 'projeto')}'\u003e${currentLang === 'en' ? 'View' : 'Ver'}\u003c/a\u003e` : ''}

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

    // CV (download opcional via content.json)
    const cvBtn = document.getElementById('cvDownload');
    if (data.cv?.url && cvBtn) {
      cvBtn.href = data.cv.url;
      if (data.cv.nome) cvBtn.setAttribute('download', data.cv.nome);
      cvBtn.style.display = 'inline-block';
      cvBtn.addEventListener('click', function() {
        const url = this.href;
        try { gtag('event', 'download_cv', { link: url }); } catch (e) {}
        console.log(`Evento GA4 enviado: download CV -> ${url}`);
      });
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
        gtag('event', 'clique_curso', { link: url, origem: currentLang === 'en' ? 'button' : 'botao' });
        console.log(`Evento GA4 enviado: curso (${currentLang === 'en' ? 'button' : 'botao'}) -\u003e ${url}`);
      });
    }
    const cursoBannerLinkEl = document.getElementById('cursoBannerLink');
    if (cursoBannerLinkEl) {
      cursoBannerLinkEl.addEventListener('click', function() {
        const url = this.href;
        gtag('event', 'clique_curso', { link: url, origem: 'banner' });
        console.log(`Evento GA4 enviado: curso (banner) -\u003e ${url}`);
      });
    }

    // Toggle de idioma
    if (langToggle) {
      langToggle.addEventListener('click', async () => {
        currentLang = currentLang === 'pt' ? 'en' : 'pt';
        localStorage.setItem('lang', currentLang);
        langToggle.textContent = currentLang === 'pt' ? 'EN' : 'PT';
        // Recarregar dados e re-renderizar seções dinâmicas
        const data = await loadContent(currentLang);
        translateStatic(currentLang);
        // Re-renderizar seções com base no novo idioma
        // Sobre
        if (data.sobre?.texto) byId('sobreText').textContent = data.sobre.texto;
        const skillsToggle = Array.isArray(data.skills)
          ? data.skills
          : (Array.isArray(data.sobre?.skills) ? data.sobre.skills : null);
        if (skillsToggle) {
          const ul = byId('skillsBadges');
          ul.innerHTML = skillsToggle.map(s => `\u003cli\u003e${s}\u003c/li\u003e`).join('');
        }
        // Experiência
        if (Array.isArray(data.experiencia)) {
          const root = byId('expTimeline');
          root.innerHTML = data.experiencia.map(exp => `
            \u003carticle class=\"card\"\u003e
              \u003ch3\u003e${exp.cargo} • ${exp.empresa}\u003c/h3\u003e
              \u003cdiv class=\"meta\"\u003e${exp.inicio} – ${exp.fim || (currentLang === 'en' ? 'Present' : 'Atual')} • ${exp.local || ''}\u003c/div\u003e
              ${Array.isArray(exp.responsabilidades) ? `\u003cul\u003e${exp.responsabilidades.map(r => `\u003cli\u003e${r}\u003c/li\u003e`).join('')}\u003c/ul\u003e` : ''}
              ${exp.stack ? `\u003cdiv class=\"meta\"\u003eStack: ${exp.stack.join(', ')}\u003c/div\u003e` : ''}
            \u003c/article\u003e
          `).join('');
        }
        // Squads
        if (Array.isArray(data.squads)) {
          const root = byId('squadsList');
          root.innerHTML = data.squads.map(sq => `
            \u003carticle class=\"card\"\u003e
              \u003ch3\u003e${sq.squad || ''} ${sq.projeto ? `• ${sq.projeto}` : ''}\u003c/h3\u003e
              ${sq.descricao ? `\u003cp class=\"meta\"\u003e${sq.descricao}\u003c/p\u003e` : ''}
            \u003c/article\u003e
          `).join('');
        }
        // Projetos
        if (Array.isArray(data.projetos)) {
          const root = byId('gallery');
          root.innerHTML = data.projetos.map(p => `
            \u003cfigure class=\"tile\"\u003e
              \u003cimg src=\"${p.imagem}\" alt=\"${p.titulo || (currentLang === 'en' ? 'Project image' : 'Imagem do projeto')}\" loading=\"lazy\" onerror=\"this.style.display='none'\"/\u003e
              \u003cfigcaption class=\"tile-caption\"\u003e
                \u003cdiv class=\"tile-row\"\u003e
                  \u003cspan class=\"tile-title\"\u003e${p.titulo || ''}\u003c/span\u003e
                  ${p.link ? `\u003ca class='btn primary small' href='${p.link}' target='_blank' rel='noopener' aria-label='${currentLang === 'en' ? 'View project' : 'Ver projeto'}: ${p.titulo || (currentLang === 'en' ? 'project' : 'projeto')}'\u003e${currentLang === 'en' ? 'View' : 'Ver'}\u003c/a\u003e` : ''}
                \u003c/div\u003e
              \u003c/figcaption\u003e
            \u003c/figure\u003e
          `).join('');
        }
        // Contatos
        if (Array.isArray(data.contatos)) {
          const root = byId('contactLinks');
          root.innerHTML = data.contatos.map(c => `
            \u003cdiv class=\"contact\"\u003e
              ${renderIcon(c.icone)}
              \u003ca href=\"${c.url}\" target=\"_blank\" rel=\"noopener\"\u003e${c.label}\u003c/a\u003e
            \u003c/div\u003e
          `).join('');
        }
        // CV
        const cvBtnToggle = document.getElementById('cvDownload');
        if (cvBtnToggle) {
          if (data.cv?.url) {
            cvBtnToggle.href = data.cv.url;
            if (data.cv.nome) cvBtnToggle.setAttribute('download', data.cv.nome);
            cvBtnToggle.style.display = 'inline-block';
          } else {
            cvBtnToggle.style.display = 'none';
          }
        }
      });
    }
    
  } catch (e) {
    console.error('Falha ao carregar content.json', e);
    byId('sobreText').textContent = 'Bem-vindo! Edite o arquivo content.json para personalizar seu portfólio.';
  }
})();

