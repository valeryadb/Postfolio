document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------
  // TEMA (DARK/LIGHT)
  // A CLASSE já foi aplicada pelo script inline no topo do <body>
  // (antes da primeira pintura — evita o "flash" do tema errado).
  // Aqui só sincronizamos o ícone/aria e tratamos o clique.
  // localStorage sempre em try/catch: em navegação privada ou com
  // cookies bloqueados, o acesso pode lançar exceção.
  // ------------------------------------------------------------------
  const themeToggle = document.getElementById("themeToggle");

  function syncThemeButton(isDark) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro"
    );
    themeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  syncThemeButton(document.body.classList.contains("dark-mode"));

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    try {
      localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    } catch (e) {}
    syncThemeButton(isDark);
  });

  // ------------------------------------------------------------------
  // MENU HAMBÚRGUER (MOBILE)
  // ------------------------------------------------------------------
  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");

  menuToggle.addEventListener("click", () => {
    const aberto = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(aberto));
    menuToggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    menuToggle.innerHTML = aberto
      ? '<i class="fa-solid fa-xmark"></i>'
      : '<i class="fa-solid fa-bars"></i>';
  });

  // Fecha o menu ao clicar em um link (senão o painel cobre a seção)
  navLinks.addEventListener("click", (e) => {
    if (e.target.closest("a") && navLinks.classList.contains("open")) {
      menuToggle.click();
    }
  });

  // ------------------------------------------------------------------
  // BOTÃO FLUTUANTE DE WHATSAPP (APARECE APÓS 20 SEGUNDOS)
  // ------------------------------------------------------------------
  const messageText = encodeURIComponent(
    "Olá Valérya, vi seu portfólio e gostaria de tirar algumas dúvidas!"
  );
  const whatsappUrl = `https://wa.me/5561981715225?text=${messageText}`;

  const waContainer = document.createElement("div");
  waContainer.id = "waFloatContainer";
  waContainer.className = "wa-float-container hidden";

  waContainer.innerHTML = `
    <div class="wa-chat-bubble" id="waChatBubble">
      <button class="wa-bubble-close" id="waBubbleClose" aria-label="Fechar balão">&times;</button>
      <div class="wa-bubble-header">
        <strong>Valérya Dias</strong>
        <span>Desenvolvedora</span>
      </div>
      <p class="wa-bubble-text">Olá! Precisa de ajuda ou tem alguma dúvida sobre meus projetos? Podemos conversar agora mesmo!</p>
    </div>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="wa-float-btn" id="waFloatBtn" title="Conversar no WhatsApp">
      <i class="fa-brands fa-whatsapp"></i>
    </a>
  `;

  document.body.appendChild(waContainer);

  setTimeout(() => {
    waContainer.classList.remove("hidden");
    waContainer.classList.add("visible");
  }, 20000);

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "waBubbleClose") {
      const bubble = document.getElementById("waChatBubble");
      if (bubble) bubble.style.display = "none";
    }
  });
});
