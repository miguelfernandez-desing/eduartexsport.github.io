/* =========================================================
   Eduartex Sport — script.js
   Sitio + chatbot en un solo archivo.
   Orden: 1 Datos · 2 Iconos y render · 3 Navegación ·
          4 Animaciones · 5 Arranque · 6 Chatbot
   ========================================================= */

/* =========================================================
   1. DATOS
   ========================================================= */
   const SITE = {
    brand: "Eduartex Sport",
    phoneDisplay: "321 928 6954",
    phoneTel: "+573219286954",
    whatsappNumber: "573219286954",
    whatsappMessage:
      "Hola, estoy interesado en los uniformes de Eduartex Sport y quisiera recibir información y cotizar un uniforme personalizado.",
    address: {
      line1: "Calle 65B #106A-32",
      line2: "Barrio El Muelle",
      line3: "Localidad Engativá, Bogotá",
    },
    schedule: "Lunes a viernes: 8:00 a.m. - 6:00 p.m.\nSábados: 10:00 a.m. - 12:00 m.",
    payments: "efectivo, Nequi, Daviplata y Bancolombia",
    minOrder: 7, // uniformes mínimos por pedido (sin máximo)
    deliveryDays: 5, // días de entrega después de aprobar diseño, listado y abono
    email: null,
    social: { instagram: null, facebook: null },
    /*
      URL que recibe los pedidos del chat y las métricas (Google Apps Script, Formspree,
      Make/Zapier, un Worker...). Recibe un POST con JSON en texto plano.
      Déjala vacía ("") y el chat funciona igual, solo que no se registra nada.
    */
    leadWebhook: "",
  };
  
  function waLink(message) {
    return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message || SITE.whatsappMessage)}`;
  }
  
  function mapsLink() {
    const query = `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.line3}`;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  
  const CATEGORIES = [
    { id: "camisetas", name: "Camisetas", icon: "jersey" },
    { id: "pantalonetas", name: "Pantalonetas", icon: "shorts" },
    { id: "medias", name: "Medias", icon: "socks" },
    { id: "tulas", name: "Tulas", icon: "bag" },
  ];
  
  // Guía de tallas. Cada rango de altura termina donde empieza el siguiente;
  // el recomendador desempata con el peso.
  const SIZE_GUIDE = {
    columns: ["Talla", "Largo (cm)", "Pecho (cm)", "Cadera (cm)", "Altura (cm)", "Peso (kg)"],
    rows: [
      ["12", 70, 48, 42, "140-150", "30-40"],
      ["14", 72, 50, 43.5, "150-155", "40-45"],
      ["16", 74, 52, 45, "155-165", "45-55"],
      ["S", 76, 54, 46, "165-170", "55-65"],
      ["M", 78, 56, 48, "170-175", "65-75"],
      ["L", 80, 58, 50, "175-180", "75-85"],
      ["XL", 82, 60, 52, "180-185", "85-95"],
      ["XXL", 84, 62, 54, "185-190", "95-105"],
      ["XXXL", 86, 64, 56, "190-200", "105-115"],
    ],
  };
  
  /*
    PRENDAS QUE SE FABRICAN. No es un catálogo fijo: todo es personalizado.
    "custom" = lo que el cliente puede personalizar en esa prenda (confírmalo con tu cliente).
    IMÁGENES: cada prenda usa una URL de imagen (image2url). Si la URL falla, se muestra el ícono.
  */
  const PRODUCTS = [
    {
      id: "camisetas",
      name: "Camisetas",
      category: "camisetas",
      icon: "jersey",
      image: "https://www.image2url.com/r2/default/images/1793240326319-9114b21d-89f4-4040-b995-70e1558110b0.webp",
      description: "Diseñadas desde cero para tu equipo, con la identidad que tú elijas.",
      custom: ["Colores", "Escudo o logo", "Números", "Nombres", "Patrocinadores"],
    },
    {
      id: "pantalonetas",
      name: "Pantalonetas",
      category: "pantalonetas",
      icon: "shorts",
      image: "https://www.image2url.com/r2/default/images/1793240519875-80595db8-f840-44c0-bb09-5ce97698671f.webp",
      description: "Hechas para combinar con tu camiseta, con los colores y detalles de tu equipo.",
      custom: ["Colores", "Escudo o logo", "Números"],
    },
    {
      id: "medias",
      name: "Medias",
      category: "medias",
      icon: "socks",
      image: "https://www.image2url.com/r2/default/images/1793240553555-e8ebdb80-90b7-4069-ace1-73498ca2870e.webp",
      description: "Para completar el uniforme en los mismos colores del equipo.",
      custom: ["Colores", "Diseño"],
    },
    {
      id: "tulas",
      name: "Tulas",
      category: "tulas",
      icon: "bag",
      image: "https://www.image2url.com/r2/default/images/1793240604478-00455a57-a17e-4a4d-be04-29ab8bfbcb45.webp",
      description: "Para llevar la dotación del equipo, con tu identidad.",
      custom: ["Colores", "Escudo o logo", "Nombre del equipo"],
    },
  ];
  
  /*
    GALERÍA DE TRABAJOS. Cada foto usa una URL de imagen (image2url); escribe aquí el nombre
    del equipo y qué se fabricó. Las imágenes van en formato vertical 4:5. El orden de esta lista es el orden en la página.
    Solo se muestran las fotos que existan: si no hay ninguna, la sección completa se oculta.
    El botón "Ver galería" aparece solo cuando haya al menos GALLERY_MIN fotos.
    Pon GALLERY_PLACEHOLDERS = true solo para previsualizarla con las fotos que ya tengas y huecos en el resto.
  */
  const GALLERY_MIN = 4; // con menos fotos que esto la sección sigue oculta (se ve mejor con filas completas)
  const GALLERY_PLACEHOLDERS = false;
  const GALLERY = [
    { image: "https://www.image2url.com/r2/default/images/1793240639989-84ad70f6-0201-412d-8f6f-e1f6c871c779.webp", title: "Las Delicias", caption: "Diseño del uniforme" },
    { image: "https://www.image2url.com/r2/default/images/1793240675173-8dfff44f-ef65-4df1-a6ac-e45782da9fc8.webp", title: "Las Delicias", caption: "Uniforme terminado" },
    { image: "https://www.image2url.com/r2/default/images/1793240707149-77149827-8252-4e3c-b633-de5af020dd88.webp", title: "CADCOM", caption: "Diseño de uniforme completo" },
    { image: "https://www.image2url.com/r2/default/images/1793240732739-ac162351-cab9-43df-8f7e-c2d5101792a0.webp", title: "F.C. El Retiro Femenino", caption: "Diseño de uniforme completo" },
    { image: "https://www.image2url.com/r2/default/images/1793240758937-281f28c2-3712-4445-abfd-5bcd082065a8.webp", title: "Diseño Fénix", caption: "Diseño de uniforme completo" },
    // Esta lleva el escudo del PSG y el logo de Nike (marcas de terceros). Actívala solo si tu cliente
    // decide mostrarla o la vuelve a generar sin esas marcas:
    // { image: "URL_DE_LA_IMAGEN", title: "La Esperanza", caption: "Diseño de uniforme completo" },
  ];
  
  /* =========================================================
     2. ICONOS Y RENDER
     ========================================================= */
  const ICONS = {
    jersey: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4 10 10l4 10 4-3v27a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V17l4 3 4-10-12-6a6 6 0 0 1-20 0Z"/></svg>`,
    shorts: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="14" y="10" width="36" height="14" rx="3"/><path d="M14 24h16v26a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4Z"/><path d="M50 24H34v26a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4Z"/></svg>`,
    socks: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M24 6h14v26l10 10a10 10 0 0 1 0 14 8 8 0 0 1-8 0H30a8 8 0 0 1-6-8V6Z"/><path d="M24 16h14"/></svg>`,
    bag: `<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="10" y="22" width="44" height="28" rx="8"/><path d="M22 22v-6a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v6"/><path d="M10 36h44"/></svg>`,
    shieldCheck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 4 6v6c0 4.5 3.2 7.9 8 9 4.8-1.1 8-4.5 8-9V6Z"/><path d="m9 12 2 2 4-4"/></svg>`,
    sparkles: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M4 12h4M16 12h4"/><path d="m7 7 2 2M15 15l2 2M17 7l-2 2M9 15l-2 2"/><circle cx="12" cy="12" r="2.4"/></svg>`,
    truck: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h11v9H3z"/><path d="M14 10h4l3 3v2h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>`,
    headset: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M19.5 19v.5a3 3 0 0 1-3 3H13"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h3.2l1.4 4.4-2 1.6a12 12 0 0 0 6.4 6.4l1.6-2 4.4 1.4V19a2 2 0 0 1-2.2 2A16 16 0 0 1 3 5.2 2 2 0 0 1 5 4Z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.02 2c-5.5 0-10 4.48-10 10 0 1.77.47 3.44 1.29 4.88L2 22l5.28-1.38A9.96 9.96 0 0 0 12.02 22c5.5 0 10-4.48 10-10s-4.5-10-10-10Zm5.85 14.2c-.25.7-1.45 1.35-2 1.44-.53.09-1.2.13-1.94-.12a17.7 17.7 0 0 1-1.76-.65c-3.1-1.34-5.12-4.46-5.28-4.67-.15-.21-1.26-1.68-1.26-3.2s.8-2.28 1.08-2.59c.28-.31.6-.38.8-.38h.58c.19 0 .44-.07.68.53s.85 2.1.92 2.25c.08.16.13.34.02.55-.1.2-.16.33-.31.5-.16.17-.33.39-.47.52-.16.16-.32.33-.14.63.19.31.83 1.38 1.79 2.24 1.23 1.1 2.26 1.44 2.57 1.6.3.16.48.13.66-.08.19-.2.79-.92.99-1.24.2-.31.4-.26.68-.16.28.1 1.77.84 2.08 1 .3.15.5.23.57.36.08.13.08.75-.17 1.45Z"/></svg>`,
    arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
    ruler: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="8" width="20" height="8" rx="1.5"/><path d="M6 8v3M10 8v4M14 8v3M18 8v4"/></svg>`,
    chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>`,
    info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8v.01"/></svg>`,
  };
  
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  
  function mediaMarkup(entry) {
    if (entry.image) {
      return `<img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.name)}" data-fallback="${escapeHtml(entry.icon)}" loading="lazy" />`;
    }
    return ICONS[entry.icon] || "";
  }
  
  function renderProducts() {
    const grid = document.getElementById("items-grid");
    if (!grid) return;
  
    grid.innerHTML = PRODUCTS.map(
      (item, i) => `
        <article class="item-card" data-reveal="up" style="--reveal-delay:${i * 0.07}s">
          <div class="item-card__media">
            <span class="item-card__tag">Personalizable</span>
            ${mediaMarkup(item)}
          </div>
          <div class="item-card__body">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="item-card__custom">
              <span class="item-card__label">Personalizas:</span>
              ${item.custom.map((c) => `<span class="chip">${escapeHtml(c)}</span>`).join("")}
            </div>
            <a class="btn btn--outline btn--sm btn--block" href="#contacto" data-open-chat>Cotizar ${escapeHtml(item.name.toLowerCase())}</a>
          </div>
        </article>`
    ).join("");
  
    // Si una imagen no carga, se muestra el ícono de la prenda
    grid.querySelectorAll(".item-card__media img").forEach((img) => {
      img.addEventListener(
        "error",
        () => {
          const holder = document.createElement("span");
          holder.innerHTML = ICONS[img.dataset.fallback] || "";
          const svg = holder.firstElementChild;
          if (svg) img.replaceWith(svg);
          else img.remove();
        },
        { once: true }
      );
    });
  }
  
  function renderSizeTable() {
    const thead = document.getElementById("sizes-head");
    const tbody = document.getElementById("sizes-body");
    if (!thead || !tbody) return;
    thead.innerHTML = `<tr>${SIZE_GUIDE.columns.map((c) => `<th>${c}</th>`).join("")}</tr>`;
    tbody.innerHTML = SIZE_GUIDE.rows
      .map((row, i) => `<tr style="--i:${i}">${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`)
      .join("");
  }
  
  /** Galería: solo se ofrece si hay suficientes fotos. Un botón dentro de "Todo a tu medida" la despliega. */
  function initGallery() {
    const cta = document.getElementById("gallery-cta");
    const btn = document.getElementById("gallery-toggle");
    const panel = document.getElementById("gallery-panel");
    const grid = document.getElementById("works-grid");
    const box = document.getElementById("lightbox");
    if (!cta || !btn || !panel || !grid) return;
  
    const probe = (g) =>
      new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(g);
        img.onerror = () => resolve(null);
        img.src = g.image;
      });
  
    Promise.all(GALLERY.map(probe)).then((found) => {
      let items = found.filter(Boolean);
      if (items.length < GALLERY_MIN) {
        if (!GALLERY_PLACEHOLDERS) return; // todavía faltan fotos: no se muestra el botón
        // Vista previa: fotos reales + huecos hasta completar el mínimo
        const missing = GALLERY.filter((g, i) => !found[i]).slice(0, GALLERY_MIN - items.length);
        items = items.concat(missing.map((g) => ({ ...g, placeholder: true })));
      }
  
      grid.innerHTML = items
        .map(
          (g, i) => `
        <figure class="work" style="animation-delay:${i * 0.06}s">
          <button type="button" class="work__btn" data-i="${i}" aria-label="Ver foto: ${escapeHtml(g.title)}, ${escapeHtml(g.caption)}">
            ${g.placeholder ? ICONS.jersey : `<img src="${escapeHtml(g.image)}" alt="${escapeHtml(g.title)}: ${escapeHtml(g.caption)}" decoding="async" />`}
            <span class="work__cap"><strong>${escapeHtml(g.title)}</strong><span>${escapeHtml(g.caption)}</span></span>
          </button>
        </figure>`
        )
        .join("");
      cta.hidden = false;
  
      // Abrir / cerrar la galería
      const label = btn.querySelector(".gallery-toggle__label");
      const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const setOpen = (open) => {
        panel.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        if (label) label.textContent = open ? "Ocultar galería" : "Ver galería";
      };
      btn.addEventListener("click", () => {
        const willOpen = !panel.classList.contains("is-open");
        setOpen(willOpen);
        if (willOpen) {
          setTimeout(
            () => panel.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "nearest" }),
            350
          );
        }
      });
      // Lo usa el chatbot para abrir la galería desde "Ver galería"
      window.openGallery = () => {
        setOpen(true);
        setTimeout(() => cta.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" }), 120);
      };
  
      // Foto ampliada
      if (!box || typeof box.showModal !== "function") return;
      const boxImg = box.querySelector("img");
      const boxCap = box.querySelector(".lightbox__cap");
      grid.addEventListener("click", (e) => {
        const b = e.target.closest(".work__btn");
        if (!b) return;
        const g = items[Number(b.dataset.i)];
        if (!g || g.placeholder) return;
        boxImg.src = g.image;
        boxImg.alt = `${g.title}: ${g.caption}`;
        boxCap.textContent = `${g.title} · ${g.caption}`;
        box.showModal();
      });
      box.querySelector(".lightbox__close").addEventListener("click", () => box.close());
      // Clic fuera de la imagen cierra
      box.addEventListener("click", (e) => {
        if (e.target === box) box.close();
      });
    });
  }
  
  function hydrateStaticContent() {
    document.querySelectorAll("[data-site-phone-display]").forEach((el) => (el.textContent = SITE.phoneDisplay));
    document.querySelectorAll("[data-site-phone-tel]").forEach((el) => el.setAttribute("href", `tel:${SITE.phoneTel}`));
    document.querySelectorAll("[data-site-address]").forEach((el) => {
      el.textContent = `${SITE.address.line1}, ${SITE.address.line2}, ${SITE.address.line3}`;
    });
    document.querySelectorAll("[data-whatsapp]").forEach((el) => {
      el.setAttribute("href", waLink(el.getAttribute("data-whatsapp-message")));
    });
    document.querySelectorAll("[data-site-schedule]").forEach((el) => (el.textContent = SITE.schedule));
    document.querySelectorAll("[data-site-maps]").forEach((el) => el.setAttribute("href", mapsLink()));
    const year = document.getElementById("current-year");
    if (year) year.textContent = new Date().getFullYear();
  }
  
  function injectIcons() {
    document.querySelectorAll("[data-icon]").forEach((el) => {
      const name = el.getAttribute("data-icon");
      if (ICONS[name]) el.innerHTML = ICONS[name];
    });
  }
  
  /* =========================================================
     3. NAVEGACIÓN
     ========================================================= */
  function initHeaderScroll() {
    const header = document.querySelector(".header");
    if (!header) return;
    const toggle = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }
  
  function initMobileMenu() {
    const toggleBtn = document.querySelector(".nav__toggle");
    const menu = document.querySelector(".mobile-menu");
    if (!toggleBtn || !menu) return;
  
    const iconEl = toggleBtn.querySelector("[data-icon]");
    const setIcon = (name) => {
      if (iconEl && ICONS[name]) iconEl.innerHTML = ICONS[name];
    };
  
    const closeMenu = () => {
      menu.classList.remove("is-open");
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Abrir menú");
      setIcon("menu");
      document.body.style.overflow = "";
    };
    const openMenu = () => {
      menu.classList.add("is-open");
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Cerrar menú");
      setIcon("close");
      document.body.style.overflow = "hidden";
    };
  
    toggleBtn.addEventListener("click", () => (menu.classList.contains("is-open") ? closeMenu() : openMenu()));
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
    // Debe coincidir con el breakpoint del CSS donde aparece el menú completo
    window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
      if (e.matches) closeMenu();
    });
  }
  
  /** Logo animado del pie: arranca cuando se ve en pantalla y queda en el último cuadro. */
  function initFooterLogo() {
    const brand = document.querySelector(".brand--footer");
    const video = brand && brand.querySelector("video");
    if (!video) return;
    // Sin animación: deja el video en su último cuadro (imagen fija)
    const fallback = () => {
      const end = () => { try { video.currentTime = video.duration || 0; } catch (e) {} };
      if (video.readyState >= 1) end();
      else video.addEventListener("loadedmetadata", end, { once: true });
    };
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return fallback();
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const p = video.play();
        if (p && typeof p.catch === "function") p.catch(fallback);
      },
      { threshold: 0.4 }
    );
    io.observe(brand);
  }

  function initActiveLink() {
    const links = document.querySelectorAll('.nav__links a[href^="#"], .mobile-menu__links a[href^="#"]');
    const sections = [...links].map((l) => document.querySelector(l.getAttribute("href"))).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
  
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = `#${entry.target.id}`;
          document.querySelectorAll(".nav__links a, .mobile-menu__links a").forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach((s) => observer.observe(s));
  }
  
  /* =========================================================
     4. ANIMACIONES
     ========================================================= */
  function initScrollReveal() {
    const items = document.querySelectorAll("[data-reveal]");
    if (!items.length) return;
  
    // Cuando termina la aparición, la tarjeta recupera su hover normal
    document.addEventListener("transitionend", (e) => {
      const el = e.target;
      if (e.propertyName === "opacity" && el.matches && el.matches("[data-reveal].is-visible")) {
        el.classList.add("revealed");
      }
    });
  
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible", "revealed"));
      return;
    }
  
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    items.forEach((el) => observer.observe(el));
  }
  
  /** Botón "Ver tallas": despliega / pliega la tabla con animación. */
  function initSizesToggle() {
    const btn = document.getElementById("sizes-toggle");
    const panel = document.getElementById("sizes-panel");
    if (!btn || !panel) return;
  
    const label = btn.querySelector(".sizes__toggle-label");
    const prefersReducedMotion = () =>
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
    const setOpen = (open) => {
      panel.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
      if (label) label.textContent = open ? "Ocultar tallas" : "Ver tallas";
    };
  
    btn.addEventListener("click", () => {
      const willOpen = !panel.classList.contains("is-open");
      setOpen(willOpen);
      if (willOpen) {
        setTimeout(
          () => panel.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "nearest" }),
          350
        );
      }
    });
  
    // Lo usa el chatbot para abrir la tabla desde "Ver tabla de tallas"
    window.openSizesTable = () => setOpen(true);
  }
  
  /* =========================================================
     5. ARRANQUE
     ========================================================= */
  // Enlaces "galería de diseños" (p. ej. en las preguntas frecuentes): abren la galería si existe
  document.addEventListener("click", (e) => {
    const a = e.target.closest && e.target.closest("[data-open-gallery]");
    if (a && typeof window.openGallery === "function") {
      e.preventDefault();
      window.openGallery();
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    injectIcons();
    hydrateStaticContent();
    renderProducts();
    renderSizeTable();
    initGallery();
  
    initHeaderScroll();
    initFooterLogo();
    initMobileMenu();
    initActiveLink();
    initScrollReveal();
    initSizesToggle();
  });
  
  /* =========================================================
     6. CHATBOT — Asesor virtual de uniformes de Eduartex Sport
     Guía al cliente paso a paso, junta los datos del uniforme,
     muestra una vista previa con sus colores y deja el pedido
     escrito para enviarlo por WhatsApp.
     Novedades: pedido rápido, pedido guardado al recargar,
     vista previa del uniforme, registro de pedidos y métricas (SITE.leadWebhook).
     Usa: SITE, CATEGORIES, SIZE_GUIDE, ICONS, waLink(), mapsLink()
     ========================================================= */
  (function () {
    "use strict";
  
    const TEXT = {
      botName: "Eduartex Sport",
      status: "Asesor de uniformes",
      greeting:
        "¡Hola! 👋 Soy el asesor virtual de **Eduartex Sport**. Todos nuestros uniformes son **personalizados**: te ayudo a armar el tuyo paso a paso y le paso tu pedido al equipo por WhatsApp.",
      menuPrompt: "¿Qué te gustaría hacer?",
      placeholder: "Escribe tu respuesta…",
      teaser: "👋 ¿Armamos el uniforme de tu equipo?",
      typingMs: 550,
    };
  
    const STORE_KEY = "cb-order";
  
    /* ---------- Utilidades ---------- */
    const norm = (s) =>
      String(s).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  
    /** Escapa el texto y permite **negrita** y saltos de línea. */
    const fmt = (s) => escapeHtml(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  
    const titleCase = (s) => String(s).trim().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
    const firstName = (s) => titleCase(String(s || "").split(/\s+/)[0] || "");
  
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const reduceMotion = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = () => window.innerWidth <= 640;
    const icon = (name) => (ICONS[name] ? ICONS[name] : "");
  
    /* ---------- Registro de pedidos y métricas ----------
       Todo es opcional: sin SITE.leadWebhook no se envía nada.
       Si la página tiene Google Analytics (gtag) o dataLayer, también se avisa ahí. */
    function post(payload) {
      if (!SITE.leadWebhook) return;
      try {
        const body = JSON.stringify(payload);
        if (navigator.sendBeacon) {
          navigator.sendBeacon(SITE.leadWebhook, new Blob([body], { type: "text/plain" }));
        } else {
          fetch(SITE.leadWebhook, { method: "POST", mode: "no-cors", body, keepalive: true });
        }
      } catch (_) {}
    }
  
    function track(event, extra) {
      const payload = { event, ts: new Date().toISOString(), page: location.href, ...(extra || {}) };
      try {
        if (Array.isArray(window.dataLayer)) window.dataLayer.push(payload);
        if (typeof window.gtag === "function") window.gtag("event", event, extra || {});
      } catch (_) {}
      post(payload);
    }
  
    let lastLead = "";
    function sendLead(status) {
      const o = state.order;
      if (!o || !Object.keys(o.data).length) return;
      const body = JSON.stringify({ status, data: o.data });
      if (body === lastLead) return; // no repetir lo mismo
      lastLead = body;
      track("lead", { status, data: o.data, summary: buildMessage(o.data) });
    }
  
    /* ---------- Guardar el pedido si recargan la página ---------- */
    function persist() {
      try {
        if (state.order) sessionStorage.setItem(STORE_KEY, JSON.stringify(state.order));
        else sessionStorage.removeItem(STORE_KEY);
      } catch (_) {}
    }
  
    function restore() {
      try {
        const raw = sessionStorage.getItem(STORE_KEY);
        if (!raw) return;
        const o = JSON.parse(raw);
        if (o && typeof o === "object" && o.data && Number.isInteger(o.i) && o.i >= 0 && o.i < ORDER.length && Array.isArray(o.hist)) {
          state.order = o;
        }
      } catch (_) {}
    }
  
    /* ---------- Recomendador de talla ---------- */
    function parseRange(str) {
      const m = String(str).match(/(\d+(?:[.,]\d+)?)\s*-\s*(\d+(?:[.,]\d+)?)/);
      if (!m) return null;
      return [parseFloat(m[1].replace(",", ".")), parseFloat(m[2].replace(",", "."))];
    }
    const distToRange = (v, [lo, hi]) => (v < lo ? lo - v : v > hi ? v - hi : 0);
  
    function recommendSize(heightCm, weightKg) {
      const rows = SIZE_GUIDE.rows;
      let best = null;
      rows.forEach((row, idx) => {
        const hr = parseRange(row[4]);
        const wr = parseRange(row[5]);
        if (!hr) return;
        let score = distToRange(heightCm, hr);
        if (weightKg && wr) score += distToRange(weightKg, wr);
        if (!best || score <= best.score) best = { row, idx, score };
      });
      if (!best) return null;
      const first = parseRange(rows[0][4]);
      const last = parseRange(rows[rows.length - 1][4]);
      return {
        size: best.row[0],
        largo: best.row[1],
        pecho: best.row[2],
        cadera: best.row[3],
        outOfRange: heightCm < first[0] - 5 || heightCm > last[1] + 5,
      };
    }
  
    function parseNumbers(text) {
      return [...String(text).matchAll(/\d+(?:[.,]\d+)?/g)].map((m) => parseFloat(m[0].replace(",", ".")));
    }
    function toHeightCm(n) {
      if (n >= 1 && n < 3) n = n * 100;
      n = Math.round(n);
      return n >= 100 && n <= 230 ? n : null;
    }
    function toWeightKg(n) {
      n = Math.round(n);
      return n >= 15 && n <= 200 ? n : null;
    }
  
    /* ---------- Vista previa del uniforme ---------- */
    const COLOR_MAP = [
      ["amarillo", "#f5c518"],
      ["celeste", "#5bc0eb"],
      ["azul", "#1f4fd8"],
      ["rojo", "#d62828"],
      ["vinotinto", "#7b1e3a"],
      ["verde", "#1f9d55"],
      ["negro", "#141414"],
      ["blanco", "#f4f4f5"],
      ["naranja", "#f77f00"],
      ["morado", "#7b2cbf"],
      ["gris", "#8d99ae"],
      ["dorado", "#d4a017"],
      ["rosado", "#ff7aa2"],
      ["rosa", "#ff7aa2"],
      ["cafe", "#6f4e37"],
    ];
  
    /** Devuelve los colores reconocidos en el texto, en el orden en que se escribieron. */
    function parseColors(text) {
      const t = norm(text);
      const found = [];
      COLOR_MAP.forEach(([name, hex]) => {
        const m = new RegExp(`\\b${name}\\b`).exec(t);
        if (m) found.push({ pos: m.index, hex });
      });
      found.sort((a, b) => a.pos - b.pos);
      return [...new Set(found.map((f) => f.hex))].slice(0, 3);
    }
  
    const lum = (hex) => {
      const n = parseInt(hex.slice(1), 16);
      return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
    };
    const contrast = (hex) => (lum(hex) > 150 ? "#141414" : "#f4f4f5");
  
    function previewSVG(colors, prendas) {
      const p = colors[0];
      const s = colors[1] || contrast(p);
      const t = colors[2] || s;
      const sh = colors[1] || p;
      const txt = prendas ? norm(prendas) : "";
      const parts = [];
      if (!txt || /camiseta/.test(txt)) parts.push("shirt");
      if (/pantaloneta/.test(txt)) parts.push("shorts");
      if (/media/.test(txt)) parts.push("socks");
      if (/tula/.test(txt)) parts.push("bag");
      if (!parts.length) parts.push("shirt");
  
      const edge = 'stroke="rgba(255,255,255,.35)" stroke-width="1.5" stroke-linejoin="round"';
      const art = {
        shirt:
          `<path d="M22 4 10 10l4 10 4-3v27a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V17l4 3 4-10-12-6a6 6 0 0 1-20 0Z" fill="${p}" ${edge}/>` +
          `<path d="M22 4 10 10l4 10 4-3Z" fill="${s}"/><path d="M42 4 54 10l-4 10-4-3Z" fill="${s}"/>` +
          `<path d="M42 4a10 10 0 0 1-20 0" fill="none" stroke="${s}" stroke-width="3" stroke-linecap="round"/>` +
          `<text x="32" y="38" text-anchor="middle" font-size="15" font-weight="700" font-family="Oswald,Inter,sans-serif" fill="${t}">10</text>`,
        shorts:
          `<rect x="14" y="10" width="36" height="14" rx="3" fill="${sh}" ${edge}/>` +
          `<path d="M14 24h16v26a4 4 0 0 1-4 4h-6a4 4 0 0 1-4-4Z" fill="${sh}" ${edge}/>` +
          `<path d="M50 24H34v26a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4Z" fill="${sh}" ${edge}/>` +
          `<path d="M14 17h36" stroke="${t}" stroke-width="2.5"/>`,
        socks:
          `<path d="M24 6h14v26l10 10a10 10 0 0 1 0 14 8 8 0 0 1-8 0H30a8 8 0 0 1-6-8V6Z" fill="${p}" ${edge}/>` +
          `<path d="M24 12h14M24 18h14" stroke="${s}" stroke-width="3"/>`,
        bag:
          `<rect x="10" y="22" width="44" height="28" rx="8" fill="${p}" ${edge}/>` +
          `<path d="M22 22v-6a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6v6" fill="none" stroke="${s}" stroke-width="3" stroke-linecap="round"/>` +
          `<path d="M10 36h44" stroke="${s}" stroke-width="2.5"/>`,
      };
      const body = parts.map((k, i) => `<g transform="translate(${i * 72 + 4} 0)">${art[k]}</g>`).join("");
      const maxW = Math.min(parts.length * 80, 290);
      return `<svg viewBox="0 0 ${parts.length * 72} 64" role="img" aria-label="Vista previa del uniforme con los colores elegidos" style="display:block;width:100%;max-width:${maxW}px;margin:.2rem 0 .45rem">${body}</svg>`;
    }
  
    /** Burbuja del bot con la vista previa. Solo aparece si se reconoció algún color. */
    function previewMsg(d) {
      const colors = parseColors(d.colores || "");
      if (!colors.length) return;
      queue = queue.then(() => {
        const el = document.createElement("div");
        el.className = "cb__msg cb__msg--bot";
        el.innerHTML =
          previewSVG(colors, d.prendas) +
          `<span style="display:block;font-size:.78rem;color:var(--cb-muted)">Vista previa de referencia con tus colores. El diseño final lo ajusta el equipo contigo.</span>`;
        log.appendChild(makeRow(el));
        scrollDown();
      });
    }
  
    /* =========================================================
       PREGUNTAS DEL PEDIDO  (edita aquí para cambiar el flujo)
       - type: "text" · "chips" (botones, también acepta texto) ·
         "multi" (varias opciones + botón Listo)
       - quick: true → también se pregunta en la cotización rápida
       - strict: (solo "multi") solo acepta las opciones de la lista
       - when(d): si devuelve false, la pregunta se salta
       - tip(v): mensaje corto después de responder (opcional)
       ========================================================= */
    const catName = (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id;
    const CAT_LIST = (() => {
      const n = CATEGORIES.map((c) => c.name.toLowerCase());
      return n.length > 1 ? n.slice(0, -1).join(", ") + " y " + n[n.length - 1] : n.join("");
    })();
  
    const isWearable = (d) => !d.prendas || /camiseta|pantaloneta/i.test(d.prendas);
    const hasShirts = (d) => !d.prendas || /camiseta/i.test(d.prendas);
    const severalItems = (d) => Boolean(d.prendas) && d.prendas.includes(",");
  
    function sizeList(d) {
      const all = SIZE_GUIDE.rows.map((r) => String(r[0]));
      const kids = all.filter((s) => /^\d+$/.test(s));
      const adults = all.filter((s) => !/^\d+$/.test(s));
      const list = d.publico === "Niños" ? kids : d.publico === "Adultos" ? adults : all;
      return list.join(", ");
    }
  
    const ORDER = [
      {
        key: "prendas",
        label: "Prendas",
        type: "multi",
        strict: true,
        quick: true,
        ask: "¿Qué prendas quieres? Marca todas las que necesites y toca **Listo ✅**.",
        invalid: `Por ahora manejamos **${CAT_LIST}** 😊 Elige entre esas opciones:`,
        options: [
          {
            label: "✨ Uniforme completo",
            preset: [catName("camisetas"), catName("pantalonetas"), catName("medias")],
          },
          ...CATEGORIES.map((c) => c.name),
        ],
      },
      {
        key: "cantidad",
        label: "Jugadores",
        type: "chips",
        quick: true,
        format: (v) => (/^\d+$/.test(v) ? `${v} jugadores` : v),
        ask: "¿Cuántos jugadores necesitan uniforme? Elige un rango o escribe el número exacto.",
        options: [`${SITE.minOrder} a 11`, "12 a 20", "21 a 30", "Más de 30"],
        tip: (v) => {
          const n = parseInt(v, 10);
          return n && n < SITE.minOrder
            ? `Ojo: el pedido mínimo es de **${SITE.minOrder} uniformes**. Igual lo dejo anotado y el equipo te cuenta las opciones.`
            : "";
        },
      },
      {
        key: "cantidades",
        label: "Cantidad por prenda",
        type: "chips",
        when: severalItems,
        ask: "¿Necesitas la misma cantidad de cada prenda? Si no, escríbela (ej: **15 camisetas, 15 pantalonetas, 2 tulas**).",
        options: [{ label: "Igual para todas", value: "" }],
      },
      {
        key: "deporte",
        label: "Deporte",
        type: "chips",
        ask: "¿Para qué deporte es?",
        options: ["Fútbol", "Fútbol sala", "Otro deporte"],
      },
      {
        key: "publico",
        label: "Para quién",
        type: "chips",
        when: isWearable,
        ask: "¿El uniforme es para adultos, niños o para ambos?",
        options: ["Adultos", "Niños", "Adultos y niños"],
      },
      {
        key: "tallas",
        label: "Tallas",
        type: "chips",
        when: isWearable,
        ask: (d) =>
          `¿Ya tienes las tallas? Escríbelas con la cantidad (ej: **4 M, 6 L, 2 XL**) o elige una opción.\nTallas disponibles: ${sizeList(d)}.`,
        options: [
          "Las defino después",
          { label: "📏 Calcular una talla", run: () => startSize() },
          { label: "Ver tabla de tallas", href: "#tallas" },
        ],
      },
      {
        key: "juegos",
        label: "Juegos de uniforme",
        type: "chips",
        when: isWearable,
        ask: "¿Quieres un solo uniforme o también uno de visitante (segundo uniforme)?",
        options: ["Solo uno", "Local y visitante"],
      },
      {
        key: "portero",
        label: "Portero",
        type: "chips",
        when: hasShirts,
        ask: "¿Necesitas uniforme de portero?",
        options: ["No necesito", "Sí, 1 portero", "Sí, 2 porteros", "Sí, más de 2"],
      },
      {
        key: "manga",
        label: "Manga",
        type: "chips",
        when: hasShirts,
        ask: "¿Las camisetas son de manga corta o larga?",
        options: ["Manga corta", "Manga larga", "Ambas"],
      },
      {
        key: "cuello",
        label: "Cuello",
        type: "chips",
        when: hasShirts,
        ask: "¿Qué tipo de cuello prefieres?",
        options: ["Redondo", "En V", "Tipo polo", "Que me asesoren"],
      },
      {
        key: "diseno",
        label: "Diseño",
        type: "chips",
        ask: "¿Ya tienes el diseño de tu uniforme?",
        options: ["Ya tengo mi diseño", "Quiero que lo diseñen", "Tengo una idea o referencia"],
        tip: (v) =>
          /^ya tengo/i.test(v)
            ? "¡Genial! 🙌 Cuando abras WhatsApp, envíanos la imagen o el archivo de tu diseño."
            : "Perfecto, el equipo te acompaña con el diseño. Si tienes fotos de referencia, también puedes enviarlas por WhatsApp.",
      },
      {
        key: "colores",
        label: "Colores",
        type: "multi",
        quick: true,
        ask: "¿Qué colores quieres? Marca los que te gusten y toca **Listo ✅**, o escríbelos (ej: azul rey con dorado). El primero será el principal.",
        options: ["Amarillo", "Azul", "Rojo", "Verde", "Negro", "Blanco", "Naranja", "Morado", "Gris"],
      },
      {
        key: "escudo",
        label: "Escudo o logo",
        type: "chips",
        ask: "¿Tu equipo tiene escudo o logo para el uniforme?",
        options: ["Sí, tengo escudo o logo", "Necesito que lo creen", "Sin escudo"],
        tip: (v) =>
          /^s[ií],/i.test(v)
            ? "Súper 👌 Envíalo por WhatsApp; mientras mejor calidad tenga la imagen, mejor se ve en el uniforme."
            : "",
      },
      {
        key: "numeracion",
        label: "Números y nombres",
        type: "chips",
        when: hasShirts,
        ask: "¿Quieres números y nombres en las camisetas?",
        options: ["Solo números", "Números y nombres", "Sin números ni nombres"],
      },
      {
        key: "fecha",
        label: "Fecha de entrega",
        type: "chips",
        ask: "¿Para cuándo lo necesitas? Elige una opción o escribe una fecha.",
        options: ["Lo antes posible", "En 1 mes", "Sin afán"],
      },
      {
        key: "ciudad",
        label: "Ciudad o barrio",
        type: "text",
        min: 2,
        format: titleCase,
        ask: "¿En qué ciudad o barrio recibirías el pedido?",
      },
      {
        key: "nombre",
        label: "Nombre",
        type: "text",
        quick: true,
        min: 2,
        format: titleCase,
        ask: "Ya casi terminamos 🙌 ¿A nombre de quién dejo el pedido? Escribe tu nombre.",
      },
      {
        key: "equipo",
        label: "Equipo",
        type: "text",
        quick: true,
        min: 2,
        format: titleCase,
        ask: (d) => `Mucho gusto, **${firstName(d.nombre)}** ¿Cómo se llama tu equipo, club o institución?`,
        options: [{ label: "Aún no tiene nombre", value: "Aún sin nombre" }],
      },
      {
        key: "notas",
        label: "Notas",
        type: "text",
        ask: "¿Quieres contarnos algo más? (referencias, patrocinadores, detalles especiales…)",
        options: [{ label: "No, eso es todo", value: "" }],
      },
    ];
  
    const quickOn = () => Boolean(state.order && state.order.quick);
    const stepOn = (s, d) => (s.when ? s.when(d) : true) && (!quickOn() || Boolean(s.quick));
    const askText = (s, d) => (typeof s.ask === "function" ? s.ask(d) : s.ask);
  
    function summaryLines(d) {
      return ORDER.filter((s) => s.key !== "nombre" && stepOn(s, d) && d[s.key]).map((s) => ({
        label: s.label,
        value: d[s.key],
      }));
    }
  
    function buildMessage(d, partial) {
      const lines = summaryLines(d).map((x) => `• *${x.label}:* ${x.value}`).join("\n");
      if (partial) {
        return (
          "Hola, vengo del chat de la página y quisiera hablar con una persona de Eduartex Sport." +
          (lines ? `\n\nEsto es lo que llevo de mi pedido:\n${lines}` : "")
        );
      }
      return (
        `Hola, soy ${d.nombre || "un cliente"} 👋 Quiero cotizar un uniforme personalizado con Eduartex Sport.\n\n` +
        `*Resumen de mi pedido*\n${lines}\n\nQuedo atento a la cotización. ¡Gracias!`
      );
    }
  
    /* ---------- Intenciones (gana la primera que coincida) ----------
       El texto del usuario llega sin tildes ni mayúsculas. */
    const INTENTS = [
      {
        id: "humano",
        re: /\b(hablar con (una |un )?(persona|asesor|alguien|humano|agente)|asesor humano|persona real|agente|operador)\b/,
        run: () => handoff("Con gusto te pasamos con una persona del equipo."),
      },
      {
        id: "personalizar",
        re: /\b(personaliz\w*|dise[nñ]\w*|escudo|logo|logotipo|numeracion|numero de camiseta|tipografia|colores|a medida|sublim\w*|estampad\w*|bordad\w*)\b/,
        run: () => {
          say("¡Claro! Todo lo hacemos a tu gusto: **colores, escudo, numeración, nombres y tipografía**. Si no tienes diseño, el equipo te acompaña a crearlo.");
          offer([startChip(), home()]);
        },
      },
      {
        id: "tiempo",
        re: /\b(tiempo|tiempos|demora|demoran|tarda|tardan|plazo|cuando llega|para cuando)\b/,
        run: () => {
          say(`La entrega es **${SITE.deliveryDays} días** después de que se aprueben el **diseño**, el **listado** de jugadores (con tallas) y el **abono**.`);
          offer([startChip(), home()]);
        },
      },
      {
        id: "envios",
        re: /\b(envio|envios|enviar|domicilio|despacho|entregan|entrega|entregas|mandan|fuera de bogota)\b/,
        run: () => {
          say("Coordinamos **envíos y entregas** según la ubicación de tu equipo. En tu pedido te pregunto la ciudad o el barrio para que el equipo te confirme cómo y cuándo.");
          offer([
            startChip(),
            waChip("Consultar mi envío", "Hola, quisiera consultar el envío de un pedido de Eduartex Sport. Mi ciudad/barrio es: "),
            home(),
          ]);
        },
      },
      {
        id: "pago",
        re: /\b(pago|pagos|pagar|nequi|daviplata|transferencia|tarjeta|efectivo|anticipo|abono)\b/,
        run: () => {
          say(`Puedes pagar con **${SITE.payments}**. Para empezar la producción se necesita un **abono**; el valor y las condiciones te las confirma el equipo en la cotización.`);
          offer([waChip("Preguntar por WhatsApp", "Hola, quisiera información sobre los medios de pago de Eduartex Sport."), home()]);
        },
      },
      {
        id: "ubicacion",
        // "local" solo cuenta cuando se refiere al negocio ("tu local", "su local"),
        // para no confundirlo con la "Camiseta Local".
        re: /\b(donde|direccion|ubicacion|ubicados|queda|(tu|su|el) local|tienda|taller|mapa|llegar|engativa|visitar)\b/,
        run: () => {
          const a = SITE.address;
          say(`📍 Estamos en **${a.line1}**, ${a.line2}, ${a.line3}.`);
          offer([{ label: "Abrir en Google Maps", href: mapsLink(), external: true }, link("Ver sección Ubicación", "#ubicacion"), home()]);
        },
      },
      {
        id: "horario",
        re: /\b(horario|horarios|abren|abierto|abiertos|cierran|atienden|atencion)\b/,
        run: () => {
          const pending = !SITE.schedule || /pr[oó]ximamente/i.test(SITE.schedule);
          say(
            pending
              ? "Todavía no tengo el horario de atención confirmado aquí. Escríbenos por WhatsApp y te respondemos con gusto."
              : `🕒 ${SITE.schedule}`
          );
          offer([waChip("Escribir por WhatsApp"), home()]);
        },
      },
      {
        id: "contacto",
        // Sin "numero": "¿qué número de talla soy?" o "números en las camisetas" no deben dar el teléfono.
        re: /\b(telefono|celular|llamar|llamada|whatsapp|wasap|contacto|contactar|correo|email|instagram|facebook|redes)\b/,
        run: () => {
          let t = `📞 Puedes llamarnos o escribirnos al **${SITE.phoneDisplay}**.`;
          if (SITE.email) t += `\n✉️ ${SITE.email}`;
          say(t);
          offer([waChip("Escribir por WhatsApp"), { label: `Llamar ${SITE.phoneDisplay}`, href: `tel:${SITE.phoneTel}` }, home()]);
        },
      },
      {
        // Va antes de "pedido" para que "quiero un precio" no inicie el pedido
        id: "precio",
        re: /\b(precio|precios|cuesta|cuestan|costo|costos|valor|cuanto (cuesta|cuestan|vale|valen|es|sale|cobran)|presupuesto|tarifa)\b/,
        run: () => {
          say("Como cada uniforme es personalizado, el precio depende de las **prendas, la cantidad, el diseño y la tela**; por eso no hay una lista fija. Cuéntame tu pedido y el equipo te envía una **cotización**.");
          offer([startChip(), quickChip(), home()]);
        },
      },
      {
        id: "pedido",
        re: /\b(cotiz\w*|encargar|encargo|pedido|armar|uniforme completo|(quiero|necesito|quisiera) (un|unos|mi|hacer|pedir|disenar)|me gustaria (un|hacer|pedir)|disenar mi)\b/,
        run: () => startOrder(),
      },
      {
        id: "proceso",
        re: /\b(como trabajan|como funciona|como es el proceso|proceso|pasos|como hacen)\b/,
        run: () => {
          say("Así trabajamos 👇\n**1.** Me cuentas qué necesitas: prendas, cantidad, colores.\n**2.** El equipo te ayuda con el **diseño** y las tallas.\n**3.** Te enviamos la **cotización**.\n**4.** Confeccionamos tu pedido **bajo pedido**.\n**5.** Coordinamos la **entrega**.");
          offer([startChip(), link("Ver cómo pedir", "#como-pedir"), link("Preguntas frecuentes", "#preguntas"), home()]);
        },
      },
      {
        id: "talla",
        re: /\b(talla|tallas|medida|medidas|size|que talla|tabla)\b/,
        run: () => {
          const sizes = SIZE_GUIDE.rows.map((r) => r[0]).join(", ");
          say(`Manejamos las tallas **${sizes}**. La guía incluye largo, pecho, cadera, altura y peso (tolerancia de ±2 cm).`);
          offer([{ label: "📏 Calcular mi talla", run: startSize }, link("Ver tabla de tallas", "#tallas"), home()]);
        },
      },
      {
        id: "material",
        re: /\b(tela|telas|material|materiales|tejido|dryfit|poliester|calidad)\b/,
        run: () => {
          say("Trabajamos con **materiales resistentes** pensados para el rendimiento. La tela se escoge según el uso, el clima y tu presupuesto, y el equipo te asesora para elegir la mejor opción.");
          offer([startChip(), home()]);
        },
      },
      {
        id: "minimo",
        re: /\b(minimo|minima|desde cuantos|cuantas unidades|una sola|solo una|individual)\b/,
        run: () => {
          say(`El pedido **mínimo es de ${SITE.minOrder} uniformes** y no hay máximo: puedes pedir la cantidad que necesites.`);
          offer([startChip(), home()]);
        },
      },
      {
        id: "ejemplos",
        re: /\b(ejemplo|ejemplos|muestra|muestras|fotos|imagenes|trabajos|portafolio|referencias)\b/,
        run: () => {
          say("¡Claro! Te invito a revisar la **galería de diseños** de la página: ahí están uniformes que hemos creado para equipos y clubes. Si quieres ver más, el equipo te comparte otros ejemplos por WhatsApp.");
          const galleryCta = document.getElementById("gallery-cta");
          const hasGallery = galleryCta && !galleryCta.hidden;
          offer([
            hasGallery ? link("🖼️ Ver galería", "#gallery-cta") : link("Ver productos en la página", "#productos"),
            waChip("Pedir ejemplos", "Hola, quisiera ver ejemplos de uniformes que han hecho en Eduartex Sport."),
            home(),
          ]);
        },
      },
      {
        id: "productos",
        re: /\b(catalogo|producto|productos|que venden|que manejan|que ofrecen|que hacen|camiseta|camisetas|pantaloneta|pantalonetas|media|medias|tula|tulas|uniforme|uniformes|ropa)\b/,
        run: () => {
          say(`Todo se fabrica **a la medida de tu equipo**. Nuestros productos base son **${CAT_LIST}**, con tus colores, escudo y numeración.`);
          offer([startChip(), link("Ver productos en la página", "#productos"), home()]);
        },
      },
      {
        id: "gracias",
        re: /\b(gracias|chao|adios|hasta luego|nos vemos)\b/,
        run: () => {
          say("¡Con gusto! 😊 Si necesitas algo más, aquí estoy. ¡Mucho éxito con tu equipo! ⚽");
          offer(mainMenu());
        },
      },
      {
        id: "saludo",
        re: /\b(hola+|holaa+|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|saludos|que tal|ayuda|menu|inicio)\b/,
        run: () => {
          say("¡Hola! 😊 ¿En qué te puedo ayudar?");
          offer(mainMenu());
        },
      },
    ];
  
    const CMD_CANCEL = /^(cancelar|salir|menu|menu principal|inicio|reiniciar)$/;
    const CMD_BACK = /^(atras|volver|regresar|anterior)$/;
    const GREETING = /^(hola+|buenas|buenos dias|buen dia|buenas tardes|buenas noches|hey|saludos|que tal)$/;
    const QUESTION = /^(cuanto|cuanta|cuantos|cuantas|cuando|donde|como|que|cual|cuales|puedo|pueden|hacen|tienen|manejan|aceptan|se puede)\b/;
  
    /* ---------- Estado y DOM ---------- */
    const state = { mode: null, order: null, size: null, pending: new Set() };
    let root, panel, log, form, input, launcher, teaser;
    let queue = Promise.resolve();
    let greeted = false;
    let avatarSrc = null;
  
    /* ---------- Avatar del bot (cara del león) ----------
       Prueba estas imágenes en orden y usa la primera que exista.
       Si no hay imagen disponible se muestra la letra "E". */
    const AVATAR_SOURCES = ["LOGO.jpeg"];
  
    function paintAvatar(el) {
      el.textContent = "";
      if (avatarSrc) {
        const img = new Image();
        img.alt = "";
        img.src = avatarSrc;
        el.appendChild(img);
      } else {
        el.textContent = "E"; // respaldo si ninguna imagen existe
      }
    }
  
    function loadAvatar() {
      const tryNext = (i) => {
        if (i >= AVATAR_SOURCES.length) return;
        const probe = new Image();
        probe.onload = () => {
          avatarSrc = AVATAR_SOURCES[i];
          root.querySelectorAll(".cb__avatar, .cb__ava").forEach(paintAvatar);
        };
        probe.onerror = () => tryNext(i + 1);
        probe.src = AVATAR_SOURCES[i];
      };
      tryNext(0);
    }
  
    /** Fila de mensaje del bot: avatar + contenido. Solo el último de una racha muestra el avatar. */
    function makeRow(content) {
      const prev = log.lastElementChild;
      if (prev && prev.classList.contains("cb__row")) prev.classList.add("cb__row--cont");
      const row = document.createElement("div");
      row.className = "cb__row";
      const ava = document.createElement("span");
      ava.className = "cb__ava";
      ava.setAttribute("aria-hidden", "true");
      paintAvatar(ava);
      row.append(ava, content);
      return row;
    }
  
    function build() {
      root = document.createElement("div");
      root.className = "cb";
      root.innerHTML = `
        <button type="button" class="cb__teaser" hidden></button>
  
        <section class="cb__panel" id="cb-panel" role="dialog" aria-label="Chat con ${escapeHtml(TEXT.botName)}" aria-modal="false">
          <header class="cb__head">
            <div class="cb__avatar" aria-hidden="true"><span>E</span></div>
            <div class="cb__title">
              <strong>${escapeHtml(TEXT.botName)}</strong>
              <span>${escapeHtml(TEXT.status)}</span>
            </div>
            <a class="cb__icon-btn cb__icon-btn--wa" data-cb-wa target="_blank" rel="noopener" aria-label="Hablar con una persona por WhatsApp" title="Hablar con una persona">${icon("whatsapp")}</a>
            <button type="button" class="cb__icon-btn" data-cb-close aria-label="Cerrar chat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
            </button>
          </header>
  
          <div class="cb__log" role="log" aria-live="polite" aria-relevant="additions"></div>
  
          <form class="cb__form" autocomplete="off">
            <input class="cb__input" type="text" maxlength="300" placeholder="${escapeHtml(TEXT.placeholder)}" aria-label="Escribe tu mensaje" enterkeyhint="send" />
            <button class="cb__send" type="submit" aria-label="Enviar mensaje">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </button>
          </form>
        </section>
  
        <button type="button" class="cb__launcher" aria-label="Abrir chat de ayuda" aria-expanded="false" aria-controls="cb-panel">
          <svg class="cb__ico-chat" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.5-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" stroke-width="2.6"/></svg>
          <svg class="cb__ico-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>
          <span class="cb__dot" aria-hidden="true"></span>
        </button>
      `;
      document.body.appendChild(root);
  
      panel = root.querySelector(".cb__panel");
      log = root.querySelector(".cb__log");
      form = root.querySelector(".cb__form");
      input = root.querySelector(".cb__input");
      launcher = root.querySelector(".cb__launcher");
      teaser = root.querySelector(".cb__teaser");
      teaser.textContent = TEXT.teaser;
  
      // Cara del león como avatar (encabezado y mensajes)
      loadAvatar();
  
      root.querySelector("[data-cb-wa]").href = waLink(
        "Hola, vengo del chat de la página y quisiera hablar con una persona de Eduartex Sport."
      );
  
      launcher.addEventListener("click", toggle);
      teaser.addEventListener("click", open);
      root.querySelector("[data-cb-close]").addEventListener("click", close);
      form.addEventListener("submit", onSubmit);
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && root.classList.contains("is-open")) close();
      });
      // Cualquier elemento con data-open-chat abre el chat
      document.querySelectorAll("[data-open-chat]").forEach((el) =>
        el.addEventListener("click", (e) => {
          e.preventDefault();
          open();
          // Cierra el menú móvil si estaba abierto
          const menu = document.querySelector(".mobile-menu.is-open");
          if (menu) document.querySelector(".nav__toggle").click();
        })
      );
  
      // Métrica: cualquier clic a WhatsApp (chat o página)
      document.addEventListener("click", (e) => {
        const a = e.target.closest && e.target.closest('a[href^="https://wa.me/"]');
        if (a) track("whatsapp_click", { from: a.closest(".cb") ? "chat" : "pagina" });
      });
  
      // Si cierran la pestaña con un pedido a medias, se guarda como lead abandonado
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "hidden") return;
        const o = state.order;
        if (o && !o.done && Object.keys(o.data).length >= 2) sendLead("abandonado");
      });
    }
  
    /* ---------- Abrir / cerrar ---------- */
    function open() {
      root.classList.add("is-open", "is-seen");
      launcher.setAttribute("aria-expanded", "true");
      launcher.setAttribute("aria-label", "Cerrar chat de ayuda");
      teaser.hidden = true;
      if (!greeted) {
        greeted = true;
        track("chat_open");
        const o = state.order;
        if (o) {
          say(o.done ? "¡Hola de nuevo! 👋 Tu pedido ya está armado." : "¡Hola de nuevo! 👋 Tienes un pedido a medias. ¿Lo seguimos?");
          offer([
            o.done
              ? { label: "↩ Ver mi resumen", run: showSummary, kind: "primary" }
              : { label: "↩ Seguir con mi pedido", run: resumeOrder, kind: "primary" },
            { label: "🔄 Empezar de nuevo", run: restartOrder, kind: "ghost" },
            { label: "Menú principal", run: showMenu, kind: "ghost" },
          ]);
        } else {
          say(TEXT.greeting);
          offer(mainMenu(), TEXT.menuPrompt);
        }
      }
      setTimeout(() => !isMobile() && input.focus(), 250);
    }
    function close() {
      root.classList.remove("is-open");
      launcher.setAttribute("aria-expanded", "false");
      launcher.setAttribute("aria-label", "Abrir chat de ayuda");
      launcher.focus({ preventScroll: true });
    }
    function toggle() {
      root.classList.contains("is-open") ? close() : open();
    }
  
    /* ---------- Pintar mensajes ---------- */
    function scrollDown() {
      log.scrollTop = log.scrollHeight;
    }
  
    function addBubble(role, html, asText) {
      const el = document.createElement("div");
      el.className = `cb__msg cb__msg--${role}`;
      if (asText) el.textContent = html; // texto del usuario: nunca como HTML
      else el.innerHTML = html;
      log.appendChild(role === "bot" ? makeRow(el) : el);
      scrollDown();
      return el;
    }
  
    function userSay(text) {
      addBubble("user", text, true);
    }
  
    /** Mensaje del bot (en cola, con indicador "escribiendo"). */
    function say(text) {
      queue = queue.then(async () => {
        const typing = document.createElement("div");
        typing.className = "cb__typing";
        typing.setAttribute("aria-hidden", "true");
        typing.innerHTML = "<i></i><i></i><i></i>";
        const typingRow = makeRow(typing);
        log.appendChild(typingRow);
        scrollDown();
        await sleep(reduceMotion() ? 120 : TEXT.typingMs);
        typingRow.remove();
        addBubble("bot", fmt(text));
      });
    }
  
    /** Muestra botones de respuesta rápida. */
    function offer(chips, preface) {
      if (preface) say(preface);
      queue = queue.then(() => {
        const wrap = document.createElement("div");
        wrap.className = "cb__chips";
        chips.forEach((c) => wrap.appendChild(makeChip(c, wrap)));
        log.appendChild(wrap);
        scrollDown();
      });
    }
  
    function chipEcho(c) {
      if (c.echo === false) return "";
      if (typeof c.echo === "function") return c.echo();
      if (c.echo) return c.echo;
      return c.label.replace(/^[^\p{L}\p{N}]+/u, "").trim() || c.label;
    }
  
    function syncPending(wrap) {
      const marked = [...wrap.querySelectorAll("[data-pick]")]
        .filter((b) => b.getAttribute("aria-pressed") === "true")
        .map((b) => b.dataset.pick);
      state.pending = new Set(marked);
      wrap.querySelectorAll("[data-preset]").forEach((p) => {
        const list = p.dataset.preset.split("|");
        p.setAttribute("aria-pressed", String(list.every((x) => state.pending.has(x))));
      });
    }
  
    function makeChip(c, wrap) {
      const isLink = Boolean(c.href);
      const el = document.createElement(isLink ? "a" : "button");
      el.className = "cb__chip" + (c.wa ? " cb__chip--wa" : "") + (c.kind ? ` cb__chip--${c.kind}` : "");
      el.textContent = c.label;
  
      if (isLink) {
        el.href = c.href;
        if (c.external || c.wa) {
          el.target = "_blank";
          el.rel = "noopener";
        } else if (c.href.startsWith("#")) {
          if (c.href === "#tallas") {
            el.addEventListener("click", () => {
              if (window.openSizesTable) window.openSizesTable();
            });
          }
          if (c.href === "#gallery-cta") {
            el.addEventListener("click", (ev) => {
              ev.preventDefault();
              if (window.openGallery) window.openGallery();
              if (isMobile()) close();
            });
          }
          if (isMobile()) el.addEventListener("click", close);
        }
      } else if (c.kind === "toggle") {
        el.type = "button";
        el.setAttribute("aria-pressed", "false");
        if (c.preset) el.dataset.preset = c.preset.join("|");
        else el.dataset.pick = c.pick;
        el.addEventListener("click", () => {
          const on = el.getAttribute("aria-pressed") !== "true";
          el.setAttribute("aria-pressed", String(on));
          if (c.preset) {
            wrap.querySelectorAll("[data-pick]").forEach((b) => {
              if (c.preset.includes(b.dataset.pick)) b.setAttribute("aria-pressed", String(on));
            });
          }
          syncPending(wrap);
        });
      } else {
        el.type = "button";
        el.addEventListener("click", () => {
          if (c.guard) {
            const msg = c.guard();
            if (msg) {
              say(msg);
              return;
            }
          }
          wrap.remove();
          const echo = chipEcho(c);
          if (echo) userSay(echo);
          c.run();
        });
      }
      return el;
    }
  
    const link = (label, href) => ({ label, href });
    const waChip = (label, message, primary) => ({
      label: "💬 " + label,
      href: waLink(message),
      wa: true,
      kind: primary ? "primary" : undefined,
    });
    const startChip = () => ({ label: "🎽 Diseñar mi uniforme", run: () => startOrder(), kind: "primary" });
    const quickChip = () => ({ label: "⚡ Cotización rápida", run: () => startOrder(true) });
  
    function clearChips() {
      log.querySelectorAll(".cb__chips").forEach((n) => n.remove());
    }
  
    /** Botón "para volver": seguir el pedido, ver el resumen o ir al menú. */
    function home() {
      const o = state.order;
      if (o && !o.done) return { label: "↩ Seguir con mi pedido", run: resumeOrder, kind: "ghost" };
      if (o && o.done) return { label: "↩ Ver mi resumen", run: showSummary, kind: "ghost" };
      return { label: "Menú principal", run: showMenu, kind: "ghost" };
    }
  
    /* ---------- Acciones generales ---------- */
    function mainMenu() {
      return [
        startChip(),
        quickChip(),
        { label: "💡 Cómo trabajamos", run: () => runIntent("proceso") },
        { label: "📏 Ayuda con tallas", run: () => runIntent("talla") },
        { label: "💰 Precios", run: () => runIntent("precio") },
        { label: "🚚 Envíos", run: () => runIntent("envios") },
        { label: "📍 Ubicación", run: () => runIntent("ubicacion") },
        waChip("Hablar con una persona"),
      ];
    }
  
    function showMenu() {
      state.mode = null;
      state.order = null;
      state.size = null;
      persist();
      say("Claro, ¿en qué te ayudo?");
      offer(mainMenu());
    }
  
    function runIntent(id) {
      INTENTS.find((i) => i.id === id).run();
    }
  
    function handoff(text) {
      const d = state.order ? state.order.data : null;
      const message = buildMessage(d || {}, true);
      say(text + " Toca el botón y se abre WhatsApp con un mensaje listo:");
      offer([waChip("Hablar con el equipo", message, true), home()]);
    }
  
    /* =========================================================
       FLUJO: ARMAR MI UNIFORME
       ========================================================= */
    function startOrder(quick) {
      if (state.order) return resumeOrder();
      state.order = { i: 0, data: {}, hist: [], editing: false, done: false, quick: Boolean(quick) };
      state.mode = "order";
      track("order_start", { quick: Boolean(quick) });
      say(
        quick
          ? "¡Va! ⚡ **Cotización rápida**: solo unas preguntas y el equipo te escribe para completar los detalles.\nPuedes escribir **atrás** o **cancelar** cuando quieras."
          : "¡Perfecto! 🎽 Todo lo hacemos **a la medida de tu equipo**. Te haré unas preguntas rápidas y al final dejo tu pedido listo para enviarlo por WhatsApp.\nPuedes escribir **atrás** o **cancelar** cuando quieras."
      );
      askStep();
    }
  
    function resumeOrder() {
      const o = state.order;
      if (!o) return startOrder();
      if (o.done) return showSummary();
      state.mode = "order";
      say("¡Seguimos con tu pedido! 👇");
      askStep();
    }
  
    /** Hace la pregunta actual. `prefix` es un aviso opcional antes de repetirla. */
    function askStep(prefix) {
      const o = state.order;
      const d = o.data;
      const step = ORDER[o.i];
      state.mode = "order";
      state.pending = new Set();
      persist();
  
      if (prefix) say(prefix);
      const on = ORDER.filter((s) => stepOn(s, d));
      const head = o.editing ? "" : `**Paso ${on.indexOf(step) + 1} de ${on.length}**\n`;
      say(head + askText(step, d));
  
      const chips = [];
      (step.options || []).forEach((opt) => {
        const op = typeof opt === "string" ? { label: opt } : opt;
        if (step.type === "multi") {
          chips.push(
            op.preset
              ? { label: op.label, kind: "toggle", preset: op.preset }
              : { label: op.label, kind: "toggle", pick: op.label }
          );
        } else if (op.href) {
          chips.push({ label: op.label, href: op.href });
        } else if (op.run) {
          chips.push({ label: op.label, run: op.run });
        } else {
          const value = op.value !== undefined ? op.value : op.label;
          chips.push({ label: op.label, run: () => answer(value) });
        }
      });
      if (step.type === "multi") {
        chips.push({
          label: "Listo ✅",
          kind: "primary",
          guard: () => (state.pending.size ? "" : "Marca al menos una opción (o escríbela abajo) 😉"),
          echo: () => [...state.pending].join(", "),
          run: () => answer([...state.pending].join(", ")),
        });
      }
      if (o.editing) chips.push({ label: "↩ Volver al resumen", kind: "ghost", run: showSummary });
      else if (o.hist.length) chips.push({ label: "⬅️ Atrás", kind: "ghost", run: goBack });
      offer(chips);
    }
  
    function answer(value) {
      const o = state.order;
      const step = ORDER[o.i];
      let v = String(value).trim();
      if (v && step.format) v = step.format(v);
      o.data[step.key] = v;
      const tip = step.tip ? step.tip(v) : "";
      if (tip) say(tip);
      if (step.key === "colores") previewMsg(o.data);
      next();
    }
  
    function next() {
      const o = state.order;
      const d = o.data;
      if (o.editing) {
        const missing = ORDER.findIndex((s) => stepOn(s, d) && d[s.key] === undefined);
        if (missing === -1) return showSummary();
        o.i = missing;
        return askStep();
      }
      let j = o.i + 1;
      while (j < ORDER.length && !stepOn(ORDER[j], d)) j++;
      if (j >= ORDER.length) return showSummary();
      o.hist.push(o.i);
      o.i = j;
      askStep();
    }
  
    function goBack() {
      const o = state.order;
      if (!o || !o.hist.length) {
        say("Esta es la primera pregunta 😊");
        return askStep();
      }
      o.i = o.hist.pop();
      askStep();
    }
  
    function askCancel() {
      say("¿Seguro que quieres cancelar tu pedido? Se borrarán tus respuestas.");
      offer([
        { label: "Sí, cancelar", run: showMenu },
        { label: "No, continuar", run: resumeOrder, kind: "primary" },
      ]);
    }
  
    /** Respuesta escrita mientras se arma el pedido. */
    function handleOrderText(raw, text) {
      const o = state.order;
      const step = ORDER[o.i];
  
      // En preguntas de texto libre (nombre, equipo…) un "Buenas Tardes FC" es una respuesta válida
      if (step.type !== "text" && GREETING.test(text)) {
        return askStep("¡Hola! 😊 Continuemos con tu pedido:");
      }
  
      const looksLikeQuestion = /\?/.test(raw) || (step.type !== "text" && QUESTION.test(text));
      if (looksLikeQuestion) {
        const hit = INTENTS.find((i) => i.re.test(text));
        if (hit && hit.id !== "pedido") return hit.run();
      }
  
      let value = raw.trim();
      if (step.type === "multi") {
        if (step.strict) {
          const picks = matchPicks(step, text);
          if (!picks.length) return askStep(step.invalid);
          value = [...new Set([...state.pending, ...picks])].join(", ");
        } else {
          value = [...state.pending, raw.trim()].join(", ");
        }
      } else if (step.type === "chips") {
        value = matchOption(step, text) ?? value;
      } else {
        const m = matchOption(step, text);
        if (m !== null) value = m;
      }
  
      if (step.min && value.length < step.min) {
        return askStep("No logré leerlo bien 🤔 Inténtalo de nuevo:");
      }
      answer(value);
    }
  
    /** Si lo escrito equivale a una de las opciones, usa el texto oficial de la opción. */
    function matchOption(step, text) {
      for (const opt of step.options || []) {
        const op = typeof opt === "string" ? { label: opt } : opt;
        if (op.run || op.href || op.preset) continue;
        const n = norm(op.label).replace(/[^\p{L}\p{N}\s]/gu, "").trim();
        if (n && (text === n || (text.length >= 4 && n.includes(text)))) {
          return op.value !== undefined ? op.value : op.label;
        }
      }
      return null;
    }
  
    /** En preguntas "strict": detecta cuáles opciones válidas menciona el texto escrito. */
    function matchPicks(step, text) {
      const picks = [];
      for (const opt of step.options || []) {
        const op = typeof opt === "string" ? { label: opt } : opt;
        const name = norm(op.label).replace(/[^\p{L}\p{N}\s]/gu, "").trim();
        if (!name) continue;
        if (op.preset) {
          if (text.includes(name) || /\bcompleto\b/.test(text)) picks.push(...op.preset);
        } else {
          const stem = name.replace(/s$/, "");
          if (new RegExp(`\\b${stem}s?\\b`).test(text)) picks.push(op.label);
        }
      }
      return picks;
    }
  
    /* ---------- Resumen y envío ---------- */
    function showSummary() {
      const o = state.order;
      o.done = true;
      o.editing = false;
      state.mode = null;
      persist();
      if (!o.tracked) {
        o.tracked = true;
        track("order_complete", { quick: Boolean(o.quick) });
      }
      sendLead("completo");
      const d = o.data;
      const lines = summaryLines(d).map((x) => `• **${x.label}:** ${x.value}`).join("\n");
      say(`¡Listo, **${firstName(d.nombre)}**! 🎉 Este es el resumen de tu uniforme:\n\n${lines}`);
      previewMsg(d);
      say(
        `Si todo está bien, toca **Enviar por WhatsApp**: se abre el chat con tu pedido ya escrito y solo falta darle enviar. El equipo te responde con la cotización 💬\nRecuerda: la entrega es **${SITE.deliveryDays} días** después de aprobar el diseño, enviar el listado de jugadores y pagar el abono.`
      );
      offer(summaryChips());
    }
  
    function summaryChips() {
      const o = state.order;
      const chips = [
        waChip("Enviar por WhatsApp", buildMessage(o.data), true),
        { label: "📋 Copiar resumen", run: copySummary },
      ];
      if (o.quick) chips.push({ label: "➕ Agregar más detalles", run: completeDetails });
      chips.push(
        { label: "✏️ Corregir algo", run: editMenu },
        { label: "🔄 Empezar de nuevo", run: restartOrder, kind: "ghost" }
      );
      return chips;
    }
  
    /** Pasa de cotización rápida a pedido completo, preguntando solo lo que falta. */
    function completeDetails() {
      const o = state.order;
      o.quick = false;
      o.editing = true;
      o.done = false;
      say("¡Claro! Te hago unas preguntas más para afinar la cotización.");
      next();
    }
  
    async function copyText(t) {
      try {
        await navigator.clipboard.writeText(t);
        return true;
      } catch (_) {
        try {
          const ta = document.createElement("textarea");
          ta.value = t;
          ta.setAttribute("readonly", "");
          ta.style.cssText = "position:fixed;opacity:0;top:0;left:0";
          document.body.appendChild(ta);
          ta.select();
          const ok = document.execCommand("copy");
          ta.remove();
          return ok;
        } catch (_e) {
          return false;
        }
      }
    }
  
    async function copySummary() {
      const ok = await copyText(buildMessage(state.order.data));
      say(
        ok
          ? "¡Copiado! 📋 Ya puedes pegarlo en WhatsApp o donde quieras."
          : "No pude copiarlo automáticamente 😕 Mejor usa el botón de WhatsApp."
      );
      offer(summaryChips());
    }
  
    function editMenu() {
      const o = state.order;
      say("¿Qué quieres corregir?");
      const chips = ORDER.map((s, i) => ({ s, i }))
        .filter(({ s }) => stepOn(s, o.data))
        .map(({ s, i }) => ({
          label: s.label,
          run: () => {
            o.i = i;
            o.editing = true;
            o.done = false;
            askStep();
          },
        }));
      chips.push({ label: "↩ Volver al resumen", kind: "ghost", run: showSummary });
      offer(chips);
    }
  
    function restartOrder() {
      state.order = null;
      state.mode = null;
      persist();
      startOrder();
    }
  
    /* =========================================================
       FLUJO: AYUDA CON TALLAS
       ========================================================= */
    function startSize() {
      state.mode = "size";
      state.size = { step: 0, data: {} };
      say("Te ayudo a encontrar la talla. ¿Cuánto mide el jugador? Escríbelo en cm (ej: **172**) o en metros (ej: **1.72**).");
    }
  
    function exitSize() {
      state.size = null;
      if (state.order && !state.order.done) return resumeOrder();
      state.mode = null;
      showMenu();
    }
  
    function handleSize(text) {
      const s = state.size;
      const nums = parseNumbers(text);
  
      if (s.step === 0) {
        const h = nums.length ? toHeightCm(nums[0]) : null;
        if (!h) {
          say("No logré leer la estatura 🤔 Escríbela así: **172** o **1.72**.");
          return;
        }
        s.data.height = h;
        const w = nums.length > 1 ? toWeightKg(nums[1]) : null;
        if (w) {
          s.data.weight = w;
          return finishSize();
        }
        s.step = 1;
        say("¡Gracias! ¿Y cuánto pesa, en kg? (ej: **68**). Si no lo sabes, escribe **no sé**.");
        return;
      }
  
      if (/\b(no se|ni idea|omitir|saltar)\b/.test(norm(text))) {
        s.data.weight = null;
        return finishSize();
      }
      const w = nums.length ? toWeightKg(nums[0]) : null;
      if (!w) {
        say("No logré leer el peso 🤔 Escríbelo en kg (ej: **68**) o escribe **no sé**.");
        return;
      }
      s.data.weight = w;
      finishSize();
    }
  
    function finishSize() {
      const { height, weight } = state.size.data;
      const r = recommendSize(height, weight);
      state.size = null;
      state.mode = state.order && !state.order.done ? "order" : null;
      if (!r) {
        handoff("No pude calcular la talla.");
        return;
      }
      let msg =
        `Para **${height} cm**${weight ? ` y **${weight} kg**` : ""}, te recomiendo la talla **${r.size}**.\n` +
        `Medidas de la prenda: largo ${r.largo} cm · pecho ${r.pecho} cm · cadera ${r.cadera} cm.`;
      if (r.outOfRange) msg += "\nEstás fuera del rango de la tabla, mejor confirma tu talla con el equipo.";
      else msg += "\nEs una guía (±2 cm). Si estás entre dos tallas, te asesoramos al pedir.";
      say(msg);
      offer([
        { label: "Probar otra medida", run: startSize },
        link("Ver tabla completa", "#tallas"),
        state.order ? home() : startChip(),
      ]);
    }
  
    /* ---------- Entrada de texto ---------- */
    function onSubmit(e) {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      input.value = "";
      handleUser(raw);
    }
  
    function handleUser(raw) {
      clearChips();
      userSay(raw);
      const text = norm(raw);
  
      if (state.mode === "size") {
        if (CMD_CANCEL.test(text) || CMD_BACK.test(text)) return exitSize();
        return handleSize(raw);
      }
      if (state.mode === "order") {
        if (CMD_BACK.test(text)) return goBack();
        if (CMD_CANCEL.test(text)) return askCancel();
        return handleOrderText(raw, text);
      }
  
      if (CMD_CANCEL.test(text)) return showMenu();
      if (/\b(que talla|mi talla|talla soy|talla me)\b/.test(text)) return startSize();
  
      const hit = INTENTS.find((i) => i.re.test(text));
      if (hit) return hit.run();
  
      say(
        "Mmm, no estoy seguro de haber entendido 🤔 Puedo ayudarte a **armar tu uniforme**, con **tallas, precios, envíos y ubicación**. Si prefieres, una persona del equipo te responde por WhatsApp."
      );
      offer(mainMenu());
    }
  
    /* ---------- Inicio ---------- */
    function init() {
      restore();
      build();
  
      // Invitación discreta, una sola vez por sesión
      let shown = false;
      try {
        shown = sessionStorage.getItem("cb-teaser") === "1";
      } catch (_) {}
      if (!shown) {
        setTimeout(() => {
          if (!root.classList.contains("is-open")) {
            teaser.hidden = false;
            try {
              sessionStorage.setItem("cb-teaser", "1");
            } catch (_) {}
            setTimeout(() => (teaser.hidden = true), 9000);
          }
        }, 8000);
      }
    }
  
    window.EduartexChat = {
      open: () => root && open(),
      close: () => root && close(),
      _recommendSize: recommendSize,
      _buildMessage: buildMessage,
    };
  
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  })();