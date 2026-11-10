# 💻 Portfólio Profissional | Valérya Dias

Landing page profissional construída com arquitetura limpa de 3 camadas:
HTML5 semântico, CSS3 com design tokens e JavaScript modular — sem
frameworks e sem build, por decisão de projeto.

🚀 **Link do projeto:** [valeryadb.github.io/portfolio](https://valeryadb.github.io/portfolio/) <!-- atualize após o deploy -->

---

## 🛠️ Tecnologias & Arquitetura

- **HTML5** — estrutura semântica, acessibilidade (atributos ARIA nos
  controles interativos) e metatags Open Graph para compartilhamento.
- **CSS3** — design system com variáveis em `:root`, Grid, Flexbox,
  animações e dark mode implementado por sobrescrita de tokens
  (`body.dark-mode` redefine as variáveis; os componentes não mudam).
- **JavaScript (ES6+)** — tema com persistência em `localStorage`
  (aplicado antes da primeira pintura para evitar flash do tema errado),
  menu mobile acessível e CTA flutuante de WhatsApp temporizado.
- **Google Fonts & Font Awesome** — tipografia editorial (Bodoni Moda &
  Inter) e ícones.

## 📂 Estrutura do repositório

```text
├── index.html        # Estrutura e marcação semântica
├── style.css         # Design tokens e regras CSS
├── main.js           # Tema, menu mobile e interatividade
├── assets/
│   ├── img/          # Previews dos projetos
│   └── pdf/          # Currículo para download
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
- **Assets em kebab-case**: nomes de arquivo sem espaços ou caracteres
  especiais, evitando URLs com `%20` e erros 404 em produção.

## ▶️ Rodando localmente

Basta abrir o `index.html` no navegador — não há dependências nem build.
