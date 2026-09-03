document.addEventListener("DOMContentLoaded", () => {
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
});