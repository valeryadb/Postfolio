# 💻 Portfólio Profissional | Valérya Dias

Landing page profissional construída com arquitetura limpa de 3 camadas:
HTML5 semântico, CSS3 com design tokens e JavaScript modular — sem
frameworks e sem build, por decisão de projeto.

🚀 **Link do projeto:** [valeryadb.github.io/portfolio](https://valeryadb.github.io/portfolio/) <!-- atualize após o deploy -->

---

## 🛠️ Tecnologias & Arquitetura

- **HTML5** — estrutura semântica, acessibilidade (atributos ARIA nos
  controles interativos) e metatags Open Graph para compartilhamento.
- **CSS3** — design system com variáveis em `:root`, Grid, Flexbox e
  CSS columns, layout de jornal (primeira página, colunas com fios,
  classificados) e dark mode por sobrescrita de tokens (`body.dark-mode`
  redefine as variáveis; os componentes não mudam).
- **JavaScript (ES6+)** — tema com persistência em `localStorage`
  (aplicado antes da primeira pintura para evitar flash do tema errado),
  data do dia no cabeçalho e CTA flutuante de WhatsApp temporizado.
- **Google Fonts & Font Awesome** — Newsreader (nome e
  texto) e Libre Franklin (apoio), além de ícones.

## 📂 Estrutura do repositório

```text
├── index.html        # Estrutura e marcação semântica
├── style.css         # Design tokens e regras CSS
├── main.js           # Tema, data e interatividade
├── assets/
│   └── img/          # Previews dos projetos
└── README.md
```

## 🧠 Decisões técnicas

- **Sem framework**: para uma landing page estática, HTML/CSS/JS puros
  carregam mais rápido e demonstram domínio dos fundamentos.
- **Dark mode por tokens**: o tema inverte redefinindo variáveis CSS em
  um único lugar, em vez de reescrever estilos componente a componente.
- **Tema aplicado inline no topo do `<body>`**: o script com `defer` só
  roda após o parse do HTML; aplicar a classe antes da primeira pintura
  elimina o "flash" do tema claro para quem usa o escuro.
- **Direção de arte de jornal**: papel `#f3f2ee`, tinta `#1b1b1b` e fios
  finos, sem cor de destaque. A personalidade vem da tipografia e da
  grade de colunas; as ilustrações dos projetos ficam em preto e branco,
  como impressas, e ganham cor ao passar o mouse.
- **Cidade em movimento no cabeçalho**: cinco clipes em preto e branco
  (comprimidos de 66 MB para 3,7 MB com FFmpeg) tocam em sequência com
  troca suave entre dois `<video>`; pausam fora da tela e, com
  `prefers-reduced-motion`, fica só o pôster.
- **Rotação dos projetos (classe `ProjectRotator`)**: animação FLIP com a
  Web Animations API. Cada projeto desliza em arco até a nova posição,
  formando um ciclo; botões Anterior/Próximo giram nos dois sentidos.
  A rotação automática (7 s) pausa pelo botão (WCAG 2.2.2), com foco de
  teclado e fora da tela, e fica desligada no celular.
- **Horizonte de Brasília em SVG no rodapé**: traço fino do Congresso
  Nacional e da Torre de TV que se desenha quando entra na tela.
- **Navegação sem menu hambúrguer**: no celular, a faixa de seções rola
  na horizontal, mantendo todos os links visíveis.
- **Assets em kebab-case**: nomes de arquivo sem espaços ou caracteres
  especiais, evitando URLs com `%20` e erros 404 em produção.

## ▶️ Rodando localmente

Basta abrir o `index.html` no navegador — não há dependências nem build.