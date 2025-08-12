# Portfólio de Eduardo Alves (QA)

Projeto de página única (one-page) estática. Edite `content.json` e a pasta `assets/` para adicionar imagens e experiências sem mexer no HTML.

## Visualizar localmente

Você pode usar um servidor HTTP simples (necessário Python 3):

```bash
cd /home/eduardo/portfolio-eduardo-alves
python3 -m http.server 8000
```

Depois acesse: http://localhost:8000

## Estrutura

- `index.html`: layout da página
- `styles.css`: estilos (tema claro/escuro)
- `script.js`: carrega `content.json` e renderiza as seções
- `content.json`: conteúdo editável (texto, experiências, projetos, contatos)
- `assets/`: coloque aqui suas imagens (perfil, projetos)

## Como adicionar imagens e experiências

1) Coloque as imagens na pasta `assets/` (ex.: `assets/perfil.jpg`, `assets/projeto1.jpg`).
2) Edite `content.json` e atualize os caminhos das imagens e os campos desejados.
3) Recarregue a página. Como o navegador pode fazer cache, durante a edição é melhor usar a página servida pelo `http.server` (o script já usa `cache: 'no-store'`).

### Exemplo de nova experiência

Adicione um objeto em `experiencia`:

```json
{
  "empresa": "Acme Corp",
  "cargo": "QA Engenheiro",
  "inicio": "Mar/2024",
  "fim": "Atual",
  "local": "Remoto",
  "responsabilidades": [
    "Cobertura de testes E2E",
    "Monitoramento de qualidade"
  ],
  "stack": ["Playwright", "GitLab CI"]
}
```

### Exemplo de novo projeto/galeria

```json
{ "titulo": "Dashboard de Qualidade", "imagem": "assets/dashboard.jpg", "link": "https://example.com" }
```

## Dicas

- Para trocar para tema claro, clique no botão 🌓 (preferência é lembrada).
- Se a foto de perfil não existir, ela some automaticamente.
- Use imagens otimizadas (JPG comprimido para fotos, PNG/SVG para gráficos).

## Deploy gratuito (opcional)

Você pode publicar facilmente em serviços estáticos:
- GitHub Pages
- Netlify
- Vercel

Se quiser, posso preparar os arquivos de deploy (por exemplo, `vercel.json` ou workflow do GitHub Pages).

