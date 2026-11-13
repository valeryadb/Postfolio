document.addEventListener("DOMContentLoaded", () => {
  // Data atual no cabeçalho e ano no rodapé
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

  // Alternância de tema (claro / escuro)
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

  // Botão flutuante de WhatsApp (exibido após 20s)
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

  // Faixa de vídeo da cidade (crossfade entre 2 players)
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

  // Rotação cíclica dos projetos
  const projectsList = document.getElementById("projectsList");
  if (projectsList) {
    new ProjectRotator(projectsList, {
      prevButton: document.getElementById("projectsPrev"),
      nextButton: document.getElementById("projectsNext"),
      status: document.getElementById("projectsStatus"),
      reducedMotion,
    });
  }

  // Animação de entrada dos elementos na rolagem
  if (!reducedMotion.matches && "IntersectionObserver" in window) {
    const singles = document.querySelectorAll(
      ".section-head, .career-lede, .portrait, .profile-text, .pullquote, " +
        ".career-group, .certificates, .classifieds > *"
    );
    const staggered = document.querySelectorAll(
      ".skills-col li, .certs-strip li, .school-certs li, .school-certs .certs-cards-grid li"
    );

    singles.forEach((el) => el.setAttribute("data-reveal", ""));
    staggered.forEach((el) => {
      el.setAttribute("data-reveal", "");
      const i = Array.from(el.parentElement.children).indexOf(el);
      el.style.setProperty("--d", `${Math.min(i, 14) * 55}ms`);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px" }
    );

    document
      .querySelectorAll("[data-reveal]:not([data-hero])")
      .forEach((el) => revealObserver.observe(el));
  }

  // Modal de visualização de certificados
  const certDialog = document.getElementById("certDialog");

  if (certDialog && typeof certDialog.showModal === "function") {
    const certImage = document.getElementById("certImage");
    const certCaption = document.getElementById("certCaption");

    document.addEventListener("click", (event) => {
      const btn = event.target.closest(".cert");
      if (!btn || !btn.dataset.full) return;

      const item = btn.closest("li");
      const titulo = item?.querySelector("h4, .record-title")?.textContent.trim();
      const meta = item?.querySelector(".cert-meta, .record-org")?.textContent.trim();
      certImage.src = btn.dataset.full;
      certImage.alt =
        btn.querySelector("img")?.alt ||
        btn.getAttribute("aria-label") ||
        titulo ||
        "Certificado ampliado";
      certCaption.textContent =
        [titulo, meta].filter(Boolean).join(" — ") || certImage.alt;
      certDialog.showModal();
    });

    document.getElementById("certClose").addEventListener("click", () => certDialog.close());
    certDialog.addEventListener("click", (event) => {
      if (event.target === certDialog) certDialog.close();
    });
  }

 // Carrossel horizontal de certificados (setas e paginação)
  const certsStrip = document.getElementById("certsGrid");
  const certsPrev = document.getElementById("certsPrev");
  const certsNext = document.getElementById("certsNext");

  if (certsStrip && certsPrev && certsNext) {
    let scrollAnimId = null;

    const getStep = () => {
      const firstCard = certsStrip.querySelector(".cert-card");
      if (!firstCard) return 280;
      const gap = parseFloat(getComputedStyle(certsStrip).columnGap || getComputedStyle(certsStrip).gap) || 0;
      return firstCard.getBoundingClientRect().width + gap;
    };

    const smoothScrollTo = (targetLeft, duration = 550) => {
      if (reducedMotion.matches) {
        certsStrip.scrollLeft = targetLeft;
        return;
      }

      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);

      const startLeft = certsStrip.scrollLeft;
      const maxScroll = certsStrip.scrollWidth - certsStrip.clientWidth;
      const clampedTarget = Math.max(0, Math.min(targetLeft, maxScroll));
      const distance = clampedTarget - startLeft;
      if (Math.abs(distance) < 1) return;

      let startTime = null;
      const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      const animate = (now) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        certsStrip.scrollLeft = startLeft + distance * easeInOutCubic(progress);

        if (progress < 1) {
          scrollAnimId = requestAnimationFrame(animate);
        } else {
          scrollAnimId = null;
        }
      };

      scrollAnimId = requestAnimationFrame(animate);
    };

    certsPrev.addEventListener("click", () => {
      const step = getStep();
      const targetIndex = Math.max(0, Math.round(certsStrip.scrollLeft / step) - 1);
      smoothScrollTo(targetIndex * step);
    });

    certsNext.addEventListener("click", () => {
      const step = getStep();
      const targetIndex = Math.round(certsStrip.scrollLeft / step) + 1;
      smoothScrollTo(targetIndex * step);
    });

    const dots = document.getElementById("certsDots");
    if (dots) {
      const pageCount = () =>
        Math.max(1, Math.ceil(certsStrip.scrollWidth / certsStrip.clientWidth));
      const current = () =>
        Math.min(
          pageCount() - 1,
          Math.round(certsStrip.scrollLeft / certsStrip.clientWidth)
        );

      const renderDots = () => {
        const n = pageCount();
        dots.innerHTML = "";
        for (let i = 0; i < n; i++) {
          const d = document.createElement("span");
          d.className = "dot" + (i === current() ? " active" : "");
          dots.appendChild(d);
        }
      };

      let raf = null;
      certsStrip.addEventListener(
        "scroll",
        () => {
          if (raf) return;
          raf = requestAnimationFrame(() => {
            raf = null;
            const n = current();
            dots.querySelectorAll(".dot").forEach((d, i) =>
              d.classList.toggle("active", i === n)
            );
          });
        },
        { passive: true }
      );
      window.addEventListener("resize", renderDots);
      renderDots();
    }
  }

  // Formulário "Conte sobre o seu projeto" (redireciona para WhatsApp ou e-mail)
  const projectForm = document.getElementById("projectForm");
  if (projectForm) {
    projectForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const nome = document.getElementById("pfNome").value.trim();
      const sobre = document.getElementById("pfMsg").value.trim();
      if (!nome || !sobre) return;

      const texto = `Olá, Valérya! Aqui é ${nome}. Sobre o meu projeto: ${sobre}`;
      const canal = event.submitter?.dataset.canal || "whatsapp";

      if (canal === "email") {
        const assunto = `Projeto — ${nome}`;
        window.location.href =
          `mailto:valeryadev@gmail.com?subject=${encodeURIComponent(assunto)}` +
          `&body=${encodeURIComponent(texto)}`;
      } else {
        window.open(
          `https://wa.me/5561981715225?text=${encodeURIComponent(texto)}`,
          "_blank",
          "noopener"
        );
      }
    });
  }

  // Animação do horizonte de Brasília no rodapé
  const skyline = document.getElementById("skyline");
  if (skyline && !reducedMotion.matches) {
    const animations = ["draw", "rise", "pen", "lights"];
    const parts = Array.from(skyline.children);
    let last = null;

    parts
      .map((el) => ({ el, x: el.getBBox().x }))
      .sort((p, q) => p.x - q.x)
      .forEach(({ el }, i) => el.style.setProperty("--i", i));

    const play = () => {
      const options = animations.filter((name) => name !== last);
      last = options[Math.floor(Math.random() * options.length)];
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

// Classe responsável pela rotação cíclica e animação FLIP dos projetos
class ProjectRotator {
  static INTERVAL = 7000;
  static DURATION = 900;
  static ARC = 0.16;

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
    this.toggleButton.hidden = this.narrow.matches;
    this.toggleButton.setAttribute("aria-pressed", String(this.paused));
    this.toggleButton.textContent = this.paused ? "Retomar" : "Pausar";
  }

  step(direction, byUser = false) {
    const items = Array.from(this.list.children);
    items.forEach((el) => el.getAnimations().forEach((anim) => anim.finish()));

    const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]));

    if (direction > 0) this.list.append(this.list.firstElementChild);
    else this.list.prepend(this.list.lastElementChild);

    if (byUser) {
      this.announce();
      this.schedule();
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

    const mx = to.left + to.width / 2 - (from.left + from.width / 2);
    const my = to.top + to.height / 2 - (from.top + from.height / 2);
    const arcX = -my * ProjectRotator.ARC;
    let arcY = mx * ProjectRotator.ARC;
    if (arcY < 0) arcY *= 0.25;

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