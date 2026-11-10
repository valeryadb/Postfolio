document.addEventListener("DOMContentLoaded", () => {
  // ------------------------------------------------------------------
  // DATA DO DIA NO CABEÇALHO (como a linha de data de um jornal)
  // O HTML já traz "Brasília, DF" como texto de reserva.
  // ------------------------------------------------------------------
  const dateline = document.getElementById("dateline");
  const year = document.getElementById("year");
  const today = new Date();

  try {
    const formatted = new Intl.DateTimeFormat("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(today);
    dateline.textContent = `Brasília, ${formatted}`;
  } catch (e) {}

  if (year) year.textContent = String(today.getFullYear());

  // ------------------------------------------------------------------
  // TEMA (CLARO / EDIÇÃO NOTURNA)
  // A classe já foi aplicada pelo script inline no topo do <body>
  // (antes da primeira pintura, evitando o "flash" do tema errado).
  // localStorage sempre em try/catch: em navegação privada ou com
  // cookies bloqueados, o acesso pode lançar exceção.
  // ------------------------------------------------------------------
  const themeToggle = document.getElementById("themeToggle");
  const themeColor = document.querySelector('meta[name="theme-color"]');

  function syncThemeButton(isDark) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute(
      "aria-label",
      isDark ? "Ativar modo claro" : "Ativar modo escuro"
    );
    themeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun" aria-hidden="true"></i><span class="theme-toggle-text">Edição diurna</span>'
      : '<i class="fa-solid fa-moon" aria-hidden="true"></i><span class="theme-toggle-text">Edição noturna</span>';
    if (themeColor) themeColor.setAttribute("content", isDark ? "#141517" : "#F3F2EE");
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
      <button class="wa-bubble-close" id="waBubbleClose" type="button" aria-label="Fechar mensagem">&times;</button>
      <div class="wa-bubble-header">
        <strong>Valérya Dias</strong>
        <span>Desenvolvedora de software</span>
      </div>
      <p class="wa-bubble-text">Quer saber mais sobre algum projeto? Me chame no WhatsApp.</p>
    </div>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="wa-float-btn" id="waFloatBtn" aria-label="Conversar no WhatsApp">
      <i class="fa-brands fa-whatsapp" aria-hidden="true"></i>
    </a>
  `;

  document.body.appendChild(waContainer);

  setTimeout(() => {
    waContainer.classList.remove("hidden");
    waContainer.classList.add("visible");
  }, 20000);

  document.getElementById("waBubbleClose").addEventListener("click", () => {
    document.getElementById("waChatBubble").style.display = "none";
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // ------------------------------------------------------------------
  // FAIXA DE VÍDEO DA CIDADE
  // Dois <video> empilhados: enquanto um toca, o outro já carrega o
  // próximo clipe; ao terminar, os dois trocam com um fade.
  // Pausa quando a faixa sai da tela ou a aba fica oculta.
  // Com movimento reduzido, fica só o pôster.
  // ------------------------------------------------------------------
  const clips = [1, 2, 3, 4, 5].map((n) => `assets/video/cidade-${n}.mp4`);
  const band = document.querySelector(".city-band");
  const videos = Array.from(document.querySelectorAll(".city-video"));

  if (band && videos.length === 2 && !reducedMotion.matches) {
    let active = 0;
    let clip = 0;
    let bandVisible = true;

    const load = (video, index) => {
      video.muted = true;
      video.src = clips[index];
      video.preload = "auto";
      video.load();
    };

    const playActive = () => {
      if (bandVisible && !document.hidden) {
        videos[active].play().catch(() => {});
      }
    };

    load(videos[0], 0);
    load(videos[1], 1);
    playActive();

    videos.forEach((video, i) => {
      video.addEventListener("ended", () => {
        if (i !== active) return;
        const previous = videos[active];
        active = 1 - active;
        clip = (clip + 1) % clips.length;
        videos[active].classList.add("is-active");
        previous.classList.remove("is-active");
        playActive();
        // Depois do fade, o vídeo que saiu carrega o clipe seguinte
        setTimeout(() => load(previous, (clip + 1) % clips.length), 1300);
      });
    });

    new IntersectionObserver(([entry]) => {
      bandVisible = entry.isIntersecting;
      if (bandVisible) playActive();
      else videos[active].pause();
    }).observe(band);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) videos[active].pause();
      else playActive();
    });
  }

  // ------------------------------------------------------------------
  // ROTAÇÃO DOS PROJETOS (classe ProjectRotator, no fim do arquivo)
  // ------------------------------------------------------------------
  const projectsList = document.getElementById("projectsList");
  if (projectsList) {
    new ProjectRotator(projectsList, {
      prevButton: document.getElementById("projectsPrev"),
      nextButton: document.getElementById("projectsNext"),
      status: document.getElementById("projectsStatus"),
      reducedMotion,
    });
  }

  // ------------------------------------------------------------------
  // HORIZONTE DE BRASÍLIA NO RODAPÉ
  // Cada vez que o rodapé entra na tela, sorteia uma de 4 animações
  // (sem repetir a anterior). Quando sai totalmente, volta a esconder
  // para a próxima visita aparecer de outro jeito.
  // ------------------------------------------------------------------
  const skyline = document.getElementById("skyline");
  if (skyline && !reducedMotion.matches) {
    const animations = ["draw", "rise", "pen", "lights"];
    const parts = Array.from(skyline.children);
    let last = null;

    // --i: ordem da esquerda para a direita (o chão vem primeiro)
    parts
      .map((el) => ({ el, x: el.getBBox().x }))
      .sort((p, q) => p.x - q.x)
      .forEach(({ el }, i) => el.style.setProperty("--i", i));

    const play = () => {
      const options = animations.filter((name) => name !== last);
      last = options[Math.floor(Math.random() * options.length)];
      // --r: atraso aleatório, usado pela animação "luzes"
      parts.forEach((el) => el.style.setProperty("--r", Math.random().toFixed(2)));
      skyline.dataset.anim = last;
    };

    new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.6 && !skyline.dataset.anim) play();
        else if (!entry.isIntersecting) delete skyline.dataset.anim;
      },
      { threshold: [0, 0.6] }
    ).observe(skyline);
  }
});

/* ====================================================================
   ProjectRotator
   Gira os projetos em ciclo: o destaque (1º da lista) vai para o fim e
   o próximo assume. "Anterior" gira no sentido contrário.

   Animação FLIP com a Web Animations API:
   - First: mede a posição de cada projeto antes da troca;
   - Last: troca a ordem no DOM e mede de novo;
   - Invert + Play: cada projeto começa visualmente onde estava e
     desliza até o lugar novo. O quadro do meio é empurrado para fora
     da reta, então o caminho vira um arco e os três juntos desenham o
     ciclo do rascunho (sentido anti-horário no "Próximo").

   Rotação automática a cada 7 s, pausada ao focar um projeto pelo
   teclado, fora da tela, com a aba oculta e no celular. Com movimento reduzido, a troca é instantânea.
==================================================================== */
class ProjectRotator {
  static INTERVAL = 7000;
  static DURATION = 900;
  static ARC = 0.16; // quanto o caminho se curva (fração da distância)

  constructor(list, { prevButton, nextButton, toggleButton, status, reducedMotion }) {
    this.list = list;
    this.prevButton = prevButton;
    this.nextButton = nextButton;
    this.toggleButton = toggleButton;
    this.status = status;
    this.reducedMotion = reducedMotion;
    this.narrow = window.matchMedia("(max-width: 640px)");

    this.timer = null;
    this.paused = reducedMotion.matches;
    this.focused = false;
    this.inView = false;

    this.bindEvents();
    this.syncToggle();
  }

  bindEvents() {
    this.nextButton?.addEventListener("click", () => this.step(1, true));
    this.prevButton?.addEventListener("click", () => this.step(-1, true));
    this.toggleButton?.addEventListener("click", () => {
      this.paused = !this.paused;
      this.syncToggle();
      this.schedule();
    });

    this.list.addEventListener("focusin", () => {
      this.focused = true;
      this.schedule();
    });
    this.list.addEventListener("focusout", (event) => {
      if (!this.list.contains(event.relatedTarget)) {
        this.focused = false;
        this.schedule();
      }
    });

    new IntersectionObserver(([entry]) => {
      this.inView = entry.isIntersecting;
      this.schedule();
    }, { threshold: 0.3 }).observe(this.list);

    document.addEventListener("visibilitychange", () => this.schedule());
    this.narrow.addEventListener("change", () => {
      this.syncToggle();
      this.schedule();
    });
  }

  get canAutoplay() {
    return !this.paused && !this.focused && this.inView && !document.hidden && !this.narrow.matches;
  }

  schedule() {
    clearInterval(this.timer);
    this.timer = this.canAutoplay
      ? setInterval(() => this.step(1), ProjectRotator.INTERVAL)
      : null;
  }

  syncToggle() {
    if (!this.toggleButton) return;
    this.toggleButton.hidden = this.narrow.matches; // no celular não há rotação automática
    this.toggleButton.setAttribute("aria-pressed", String(this.paused));
    this.toggleButton.textContent = this.paused ? "Retomar" : "Pausar";
  }

  // direction: 1 = próximo, -1 = anterior
  step(direction, byUser = false) {
    const items = Array.from(this.list.children);
    items.forEach((el) => el.getAnimations().forEach((anim) => anim.finish()));

    const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]));

    if (direction > 0) this.list.append(this.list.firstElementChild);
    else this.list.prepend(this.list.lastElementChild);

    if (byUser) {
      this.announce();
      this.schedule(); // reinicia a contagem após um clique
    }

    if (this.reducedMotion.matches) return;
    const lead = this.list.firstElementChild;
    items.forEach((el) => this.animateFrom(el, before.get(el), el === lead));
  }

  animateFrom(el, from, isNewLead) {
    const to = el.getBoundingClientRect();
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const scale = from.width / to.width;
    if (!dx && !dy && scale === 1) return;

    // Vetor do movimento (centro antigo -> centro novo) e sua
    // perpendicular: é para lá que o meio do caminho é empurrado.
    const mx = to.left + to.width / 2 - (from.left + from.width / 2);
    const my = to.top + to.height / 2 - (from.top + from.height / 2);
    const arcX = -my * ProjectRotator.ARC;
    let arcY = mx * ProjectRotator.ARC;
    if (arcY < 0) arcY *= 0.25; // arco para cima fica contido: não invade o título

    // quem vai virar destaque passa por cima dos outros
    el.style.zIndex = isNewLead ? "2" : "1";

    el.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 1 },
        {
          transform: `translate(${dx / 2 + arcX}px, ${dy / 2 + arcY}px) scale(${(scale + 1) / 2})`,
          opacity: isNewLead ? 0.85 : 0.3,
          offset: 0.5,
        },
        { transform: "none", opacity: 1 },
      ],
      { duration: ProjectRotator.DURATION, easing: "cubic-bezier(0.65, 0, 0.35, 1)" }
    ).finished.then(() => { el.style.zIndex = ""; }).catch(() => {});
  }

  announce() {
    const title = this.list.firstElementChild?.querySelector("h3")?.textContent;
    if (this.status && title) this.status.textContent = `Em destaque: ${title}`;
  }
}
