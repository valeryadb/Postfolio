document.addEventListener("DOMContentLoaded", () => {
  // LÓGICA DE ALTERNÂNCIA DE TEMA (DARK/LIGHT MODE)
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("portfolio-theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggle.setAttribute("aria-pressed", "true");
    themeToggle.setAttribute("aria-label", "Ativar modo claro");
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-mode");
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro"
    );
    themeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });

  // BOTÃO FLUTUANTE DE WHATSAPP (APARECE APÓS 20 SEGUNDOS)
  const messageText = encodeURIComponent("Olá Valérya, vi seu portfólio e gostaria de tirar algumas dúvidas!");
  const whatsappUrl = `https://wa.me/5561981715225?text=${messageText}`;

  // Criar o container flutuante do WhatsApp
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
