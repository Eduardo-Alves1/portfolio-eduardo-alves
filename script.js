// Sistema de portfólio com conteúdo integrado no HTML e funcionalidades de tema e idioma
(function init() {
  const byId = (id) => document.getElementById(id);

  // Sistema de tema
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.setAttribute('data-theme', 'light');
  }

  const themeToggleEl = byId('themeToggle');
  themeToggleEl.setAttribute('aria-pressed', document.documentElement.getAttribute('data-theme') === 'light' ? 'true' : 'false');

  themeToggleEl.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    const nextIsLight = !isLight;
    document.documentElement.setAttribute('data-theme', nextIsLight ? 'light' : '');
    localStorage.setItem('theme', nextIsLight ? 'light' : 'dark');
    themeToggleEl.setAttribute('aria-pressed', nextIsLight ? 'true' : 'false');
  });

  // Sistema de idioma
  const savedLang = localStorage.getItem('lang') || 'pt';
  let currentLang = savedLang;
  const langToggle = byId('langToggle');
  if (langToggle) langToggle.textContent = currentLang === 'pt' ? 'EN' : 'PT';

  // Atualizar ano no rodapé
  const yearElement = byId('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // Função para traduzir conteúdo estático
  function translateStatic(lang) {
    // Navegação
    const navLinks = document.querySelectorAll('.nav a[data-pt][data-en]');
    navLinks.forEach(link => {
      link.textContent = lang === 'en' ? link.getAttribute('data-en') : link.getAttribute('data-pt');
    });

    // Títulos de seção
    const sectionTitles = document.querySelectorAll('h2[data-pt][data-en]');
    sectionTitles.forEach(title => {
      title.textContent = lang === 'en' ? title.getAttribute('data-en') : title.getAttribute('data-pt');
    });

    // Hero subtitle
    const heroSubtitle = document.querySelector('.subtitle[data-pt][data-en]');
    if (heroSubtitle) {
      heroSubtitle.textContent = lang === 'en' ? heroSubtitle.getAttribute('data-en') : heroSubtitle.getAttribute('data-pt');
    }

    // Botões CTA
    const ctaButtons = document.querySelectorAll('.cta a[data-pt][data-en]');
    ctaButtons.forEach(btn => {
      btn.textContent = lang === 'en' ? btn.getAttribute('data-en') : btn.getAttribute('data-pt');
    });

    // Botão CV
    const cvBtn = byId('cvDownload');
    if (cvBtn) {
      cvBtn.textContent = lang === 'en' ? 'Download CV' : 'Baixar CV';
    }

    // Botão do curso
    const cursoBtn = byId('cursoLink');
    if (cursoBtn) {
      cursoBtn.textContent = lang === 'en' ? 'Access the course' : 'Acessar o curso';
    }

    // Rodapé
    const footerP = document.querySelector('.site-footer p[data-pt][data-en]');
    if (footerP) {
      footerP.innerHTML = lang === 'en' 
        ? '© <span id="year"></span> Eduardo Alves. All rights reserved.'
        : '© <span id="year"></span> Eduardo Alves. Todos os direitos reservados.';
      const yearElement = byId('year');
      if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
      }
    }
  }

  // Função para traduzir conteúdo dinâmico
  function translateDynamic(lang) {
    // Texto sobre
    const sobreText = byId('sobreText');
    if (sobreText) {
      sobreText.textContent = lang === 'en' ? sobreText.getAttribute('data-en') : sobreText.getAttribute('data-pt');
    }

    // Experiência
    const expItems = document.querySelectorAll('#expTimeline .card .meta[data-pt][data-en]');
    expItems.forEach(item => {
      item.textContent = lang === 'en' ? item.getAttribute('data-en') : item.getAttribute('data-pt');
    });

    const expListItems = document.querySelectorAll('#expTimeline .card li[data-pt][data-en]');
    expListItems.forEach(item => {
      item.textContent = lang === 'en' ? item.getAttribute('data-en') : item.getAttribute('data-pt');
    });

    // Squads
    const squadTitles = document.querySelectorAll('#squadsList .card h3[data-pt][data-en]');
    squadTitles.forEach(title => {
      title.textContent = lang === 'en' ? title.getAttribute('data-en') : title.getAttribute('data-pt');
    });

    const squadDescriptions = document.querySelectorAll('#squadsList .card .meta[data-pt][data-en]');
    squadDescriptions.forEach(desc => {
      desc.textContent = lang === 'en' ? desc.getAttribute('data-en') : desc.getAttribute('data-pt');
    });

    // Projetos
    const projectTitles = document.querySelectorAll('#gallery .tile-title[data-pt][data-en]');
    projectTitles.forEach(title => {
      title.textContent = lang === 'en' ? title.getAttribute('data-en') : title.getAttribute('data-pt');
    });

    const projectButtons = document.querySelectorAll('#gallery .btn[data-pt][data-en]');
    projectButtons.forEach(btn => {
      btn.textContent = lang === 'en' ? btn.getAttribute('data-en') : btn.getAttribute('data-pt');
    });

    // Curso
    const cursoDescricao = byId('cursoDescricao');
    if (cursoDescricao) {
      cursoDescricao.textContent = lang === 'en' ? cursoDescricao.getAttribute('data-en') : cursoDescricao.getAttribute('data-pt');
    }
  }

  // Inicializar traduções
  translateStatic(currentLang);
  translateDynamic(currentLang);

  // Toggle de idioma
  if (langToggle) {
    langToggle.addEventListener('click', () => {
      currentLang = currentLang === 'pt' ? 'en' : 'pt';
      localStorage.setItem('lang', currentLang);
      langToggle.textContent = currentLang === 'pt' ? 'EN' : 'PT';
      
      // Aplicar traduções
      translateStatic(currentLang);
      translateDynamic(currentLang);
    });
  }

  // Eventos de analytics para CV
  const cvBtn = byId('cvDownload');
  if (cvBtn) {
    cvBtn.addEventListener('click', function() {
      const url = this.href;
      gtag('event', 'download_cv', { link: url });
    });
  }

  // Eventos de analytics para contatos
  document.getElementById('contactLinks').addEventListener('click', function(event) {
    const link = event.target.closest('a');
    if (link) {
      const label = link.textContent.trim();
      const url = link.href;
      gtag('event', 'clique_contato', { tipo: label, link: url });
    }
  });

  // Eventos de analytics para curso
  const cursoLinkEl = byId('cursoLink');
  if (cursoLinkEl) {
    cursoLinkEl.addEventListener('click', function() {
      const url = this.href;
      gtag('event', 'clique_curso', { 
        link: url, 
        origem: currentLang === 'en' ? 'button' : 'botao' 
      });
    });
  }

  // Eventos de analytics para projetos
  document.getElementById('gallery').addEventListener('click', function(event) {
    const projectLink = event.target.closest('a[href^="http"]');
    if (projectLink) {
      const projectTitle = projectLink.closest('.tile').querySelector('.tile-title').textContent;
      const url = projectLink.href;
      gtag('event', 'clique_projeto', { titulo: projectTitle, link: url });
    }
  });
})();

