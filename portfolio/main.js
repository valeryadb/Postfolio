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

  // ------------------------------------------------------------------
  // FOTOS PENDENTES: figure[data-pending] tenta carregar a imagem; se o
  // arquivo ainda não existe (404), troca por um quadro "Fotos em breve".
  // Para publicar a foto real, basta soltar o .jpg na pasta — sem código.
  // ------------------------------------------------------------------
  document.querySelectorAll(".photo[data-pending] img").forEach((img) => {
    const swap = () => {
      const box = document.createElement("div");
      box.className = "photo-placeholder";
      box.setAttribute("role", "img");
      box.setAttribute("aria-label", `${img.alt} — fotos em breve`);
      box.innerHTML = "<strong>Fotos em breve</strong><span>Sistema em ajuste final</span>";
      img.replaceWith(box);
    };
    // se o erro aconteceu antes deste script rodar, o evento já passou
    if (img.complete && img.naturalWidth === 0) swap();
    else img.addEventListener("error", swap, { once: true });
  });

  // ------------------------------------------------------------------
  // PRÉ-VISUALIZAÇÃO: todo card com data-preview="URL" ganha o botão
  // "Pré-visualizar", que abre a demo num iframe sobre a página. O src
  // só é definido ao abrir e é limpo ao fechar, para o site externo não
  // carregar junto com o jornal nem continuar rodando escondido.
  // ------------------------------------------------------------------
  const previewDialog = document.getElementById("previewDialog");
  if (previewDialog && typeof previewDialog.showModal === "function") {
    const frame = document.getElementById("previewFrame");
    const titleEl = document.getElementById("previewTitle");
    const openLink = document.getElementById("previewOpen");

    document.querySelectorAll(".story[data-preview]").forEach((card) => {
      const url = card.dataset.preview;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "story-link story-preview";
      btn.innerHTML = '<i class="fa-regular fa-eye" aria-hidden="true"></i> Pré-visualizar';
      btn.addEventListener("click", () => {
        titleEl.textContent = card.querySelector("h3")?.textContent || "Projeto";
        frame.src = url;
        if (openLink) openLink.href = url;
        previewDialog.showModal();
      });
      (card.querySelector(".story-links") || card).appendChild(btn);
    });

    previewDialog.addEventListener("close", () => {
      frame.src = "about:blank"; // descarrega a demo ao fechar
    });
    document.getElementById("previewClose")?.addEventListener("click", () => previewDialog.close());
    previewDialog.addEventListener("click", (event) => {
      if (event.target === previewDialog) previewDialog.close();
    });
  }

  // GitHub: terminal interativo + grade de contribuições (funções no fim do arquivo)
  initGitHubTerminal(reducedMotion);
  initContributions(document.getElementById("ghPanel")?.dataset.user);

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
        ".career-group, .certificates, .gh-panel, .classifieds > *"
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

/* =====================================================================
   GITHUB
   Os dados vêm da API pública do GitHub, buscados no navegador de quem
   visita (o site continua estático: sem servidor, sem chave de API).
   Sem autenticação, a API permite 60 consultas/hora por IP — por isso
   guardamos as respostas por 10 minutos no sessionStorage.
   ===================================================================== */
async function fetchJSONCached(url, key, ttlMs = 10 * 60 * 1000) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) || "null");
    if (cached && Date.now() - cached.t < ttlMs) return cached.d;
  } catch {
    /* navegação privada: segue sem cache */
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(res.status === 403 || res.status === 429 ? "limite" : `http ${res.status}`);
  const data = await res.json();
  try {
    sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), d: data }));
  } catch {
    /* armazenamento cheio ou bloqueado: tudo bem */
  }
  return data;
}

const LANG_COLORS = {
  JavaScript: "#d6bf55",
  TypeScript: "#5a8fd6",
  Python: "#4fae9b",
  HTML: "#e07850",
  CSS: "#9b7fd6",
  Java: "#b8865a",
  Shell: "#8bc34a",
  "Jupyter Notebook": "#da7b4f",
};
const langColor = (name) => LANG_COLORS[name] || "#8a8a8a";

function initGitHubTerminal(reducedMotion) {
  const panel = document.getElementById("ghPanel");
  const screen = document.getElementById("termScreen");
  const form = document.getElementById("termForm");
  const input = document.getElementById("termCmd");
  const chips = document.getElementById("termChips");
  if (!panel || !screen || !form || !input || !chips) return;

  const user = panel.dataset.user;
  const instant = reducedMotion.matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, instant ? 0 : ms));
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  // Os links vêm da própria página: se o currículo mudar no HTML,
  // o terminal acompanha sozinho (uma fonte da verdade só).
  const links = {
    curriculo: document.querySelector('a[href*="docs.google.com"]')?.href,
    linkedin: document.querySelector('a[href*="linkedin.com"]')?.href,
  };

  // ---------- impressão no terminal ----------
  // Tudo que vem de fora (o que o visitante digita, nomes de repositório)
  // entra com textContent, nunca innerHTML — é o que impede XSS.
  const line = (cls = "") => {
    const p = document.createElement("p");
    p.className = `t-line ${cls}`.trim();
    screen.appendChild(p);
    return p;
  };
  // Rola para o fim DEPOIS que o conteúdo entra na tela (rolar dentro de
  // line() mediria a linha ainda vazia e cortaria o final).
  new MutationObserver(() => {
    screen.scrollTop = screen.scrollHeight;
  }).observe(screen, { childList: true, subtree: true, characterData: true });
  const say = (text, cls) => {
    const p = line(cls);
    p.textContent = text;
    return p;
  };
  const userTag = () => {
    const s = document.createElement("span");
    s.className = "t-user";
    s.textContent = "visitante@valerya";
    return s;
  };
  const echo = (cmd) => {
    const p = line("t-gap");
    p.append(userTag(), ":~$ ", cmd);
  };
  const link = (text, href) => {
    const a = document.createElement("a");
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = text;
    return a;
  };

  async function typeCommand(cmd) {
    const p = line("t-gap");
    const typed = document.createTextNode("");
    p.append(userTag(), ":~$ ", typed);
    if (instant) {
      typed.data = cmd;
      return;
    }
    p.classList.add("t-cursor");
    for (const ch of cmd) {
      typed.data += ch;
      await sleep(42);
    }
    await sleep(260);
    p.classList.remove("t-cursor");
  }

  function ago(iso) {
    const diff = (new Date(iso) - Date.now()) / 1000; // ISO com "Z": fuso resolvido
    const units = [
      ["year", 31536000],
      ["month", 2592000],
      ["week", 604800],
      ["day", 86400],
      ["hour", 3600],
      ["minute", 60],
    ];
    for (const [unit, secs] of units) {
      if (Math.abs(diff) >= secs) return rtf.format(Math.round(diff / secs), unit);
    }
    return "agora há pouco";
  }

  // ---------- gh profile view ----------
  async function profileView(typed) {
    if (typed) await typeCommand(`gh profile view ${user}`);
    const loading = say("→ consultando a API do GitHub…", "t-dim");
    try {
      const [profile, repos] = await Promise.all([
        fetchJSONCached(`https://api.github.com/users/${user}`, "gh:profile"),
        fetchJSONCached(`https://api.github.com/users/${user}/repos?per_page=100&sort=pushed`, "gh:repos"),
      ]);
      loading.remove();

      const p1 = line();
      p1.append("→ ");
      const n = document.createElement("span");
      n.className = "t-strong";
      n.textContent = `${profile.public_repos} repositórios públicos`;
      p1.append(n);

      // o repositório com o mesmo nome do usuário é o README do perfil
      const recent = repos.filter((r) => r.name.toLowerCase() !== user.toLowerCase());
      if (recent[0]) {
        const p2 = line();
        const quem = document.createElement("span");
        quem.className = "t-dim";
        quem.textContent = ` (${recent[0].name})`;
        p2.append(`→ último push: ${ago(recent[0].pushed_at)}`, quem);

        const p3 = line();
        p3.append("→ atividade recente: ");
        recent.slice(0, 3).forEach((r, i) => {
          if (i) p3.append(", ");
          p3.append(link(r.name, r.html_url));
        });
      }

      const counts = {};
      repos.forEach((r) => {
        if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
      });
      const langs = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      if (langs.length) {
        say("→ linguagens por repositório");
        const bar = document.createElement("div");
        bar.className = "t-langbar";
        bar.setAttribute("aria-hidden", "true");
        langs.forEach(([name, qtd]) => {
          const seg = document.createElement("i");
          seg.style.flex = String(qtd);
          seg.style.background = langColor(name);
          bar.appendChild(seg);
        });
        screen.appendChild(bar);
        const legend = line("t-legend");
        langs.forEach(([name, qtd]) => {
          const s = document.createElement("span");
          s.style.setProperty("--c", langColor(name));
          s.textContent = `${name} ${qtd}`;
          legend.appendChild(s);
        });
      }
    } catch (err) {
      loading.remove();
      say(
        err.message === "limite"
          ? "→ a API do GitHub pediu uma pausa (limite de consultas por hora)."
          : "→ não consegui falar com a API do GitHub agora.",
        "t-dim"
      );
      const p = line();
      p.append("→ o perfil continua em ", link(`github.com/${user}`, `https://github.com/${user}`));
    }
  }

  // ---------- comandos ----------
  const COMMANDS = {
    "/ajuda": () => {
      say("comandos disponíveis:");
      [
        ["/sobre", "quem é a Valérya"],
        ["/curriculo", "abre o currículo"],
        ["/linkedin", "abre o LinkedIn"],
        ["/contato", "vai para a seção de contato"],
        ["/github", "atualiza os dados do GitHub"],
        ["/limpar", "limpa a tela"],
      ].forEach(([c, d]) => say(`  ${c.padEnd(12)} ${d}`, "t-dim"));
    },
    "/sobre": () => {
      say("Valérya Dias — desenvolvedora back-end em Brasília, DF.");
      say("Node.js · TypeScript · Python · SQL · APIs REST", "t-dim");
      say("Do xadrez para o código: pensar antes de cada jogada.", "t-dim");
    },
    "/curriculo": () => {
      if (!links.curriculo) return say("currículo indisponível no momento.", "t-dim");
      window.open(links.curriculo, "_blank", "noopener");
      say("abrindo o currículo em uma nova aba…", "t-ok");
    },
    "/linkedin": () => {
      if (!links.linkedin) return say("LinkedIn indisponível no momento.", "t-dim");
      window.open(links.linkedin, "_blank", "noopener");
      say("abrindo o LinkedIn em uma nova aba…", "t-ok");
    },
    "/contato": () => {
      say("indo para a seção de contato…", "t-ok");
      document.getElementById("contato")?.scrollIntoView({ behavior: instant ? "auto" : "smooth" });
    },
    "/github": () => profileView(false),
    "/limpar": () => {
      screen.textContent = "";
    },
  };
  const ALIASES = { "/help": "/ajuda", "/clear": "/limpar", "/cv": "/curriculo", "/resume": "/curriculo" };

  let busy = false;
  async function run(raw) {
    const text = raw.trim();
    if (!text || busy) return;
    busy = true;
    echo(text);
    let cmd = text.toLowerCase();
    if (!cmd.startsWith("/")) cmd = `/${cmd}`;
    const fn = COMMANDS[ALIASES[cmd] || cmd];
    try {
      // window.open roda aqui sem await antes: ainda dentro do clique,
      // então o bloqueador de pop-up do navegador não barra
      if (fn) await fn();
      else say(`comando não encontrado: ${text} — digite /ajuda`, "t-dim");
    } finally {
      busy = false;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    run(input.value);
    input.value = "";
  });
  chips.addEventListener("click", (event) => {
    const btn = event.target.closest("button[data-cmd]");
    if (btn) run(btn.dataset.cmd);
  });

  // Com JS, o terminal vira interativo; a abertura roda quando aparece na tela
  form.hidden = false;
  chips.hidden = false;

  let started = false;
  const start = async () => {
    if (started) return;
    started = true;
    busy = true;
    screen.textContent = "";
    say("Valérya.dev — terminal do portfólio", "t-dim");
    say("Digite /ajuda para ver os comandos.", "t-dim");
    await profileView(true);
    busy = false;
  };

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.35 }
    );
    io.observe(panel);
  } else {
    start();
  }
}

async function initContributions(user) {
  const box = document.getElementById("ghContrib");
  const grid = document.getElementById("ghContribGrid");
  const totalEl = document.getElementById("ghContribTotal");
  if (!user || !box || !grid || !totalEl) return;

  try {
    // O GitHub não expõe contribuições sem autenticação; este serviço
    // público lê o calendário do perfil e devolve em JSON.
    const data = await fetchJSONCached(
      `https://github-contributions-api.jogruber.de/v4/${user}?y=last`,
      "gh:contrib",
      60 * 60 * 1000
    );
    const days = data?.contributions;
    if (!Array.isArray(days) || !days.length) return;

    // A 1ª coluna começa no dia da semana do primeiro dia. Data montada
    // com (ano, mês, dia) = horário LOCAL — new Date("AAAA-MM-DD") seria
    // UTC e, em Brasília, voltaria para o dia anterior.
    const [y, m, d] = days[0].date.split("-").map(Number);
    const offset = new Date(y, m - 1, d).getDay();

    const frag = document.createDocumentFragment();
    for (let i = 0; i < offset; i++) {
      const cell = document.createElement("i");
      cell.className = "is-empty";
      frag.appendChild(cell);
    }
    days.forEach((day) => {
      const cell = document.createElement("i");
      cell.dataset.l = String(day.level);
      cell.title = `${day.count} contribuições em ${day.date.split("-").reverse().join("/")}`;
      frag.appendChild(cell);
    });
    grid.appendChild(frag);

    const total = data.total?.lastYear ?? days.reduce((s, day) => s + day.count, 0);
    totalEl.textContent = String(total);
    box.hidden = false;
    grid.scrollLeft = grid.scrollWidth; // celular: começa nas semanas recentes
  } catch {
    /* serviço fora do ar: o bloco simplesmente não aparece */
  }
}
