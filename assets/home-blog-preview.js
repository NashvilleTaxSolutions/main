const blogPreviewRoot = document.querySelector("main");

function setupHomeNavigation() {
  const homeNavigation = document.querySelector("header nav");
  document.querySelectorAll('a[href^="./"]').forEach((link) => {
    const href = link.getAttribute("href");
    const match = href.match(/^\.\/([^?#]+)$/);
    if (match && !match[1].includes(".") && !match[1].endsWith("/")) {
      link.setAttribute("href", `./${match[1]}/`);
    }
  });

  if (!homeNavigation) {
    console.error("Could not find the homepage navigation.");
    return;
  }

  homeNavigation.id = "home-mobile-navigation";
  homeNavigation.dataset.homeMobileNav = "";
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "home-mobile-menu-toggle";
  toggle.setAttribute("aria-label", "Open navigation");
  toggle.setAttribute("aria-controls", homeNavigation.id);
  toggle.setAttribute("aria-expanded", "false");
  toggle.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"></path></svg>';
  homeNavigation.after(toggle);

  const menuStyles = document.createElement("style");
  menuStyles.textContent = `
    .home-mobile-menu-toggle { display: none; }
    @media (max-width: 1023px) {
      .home-mobile-menu-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2.75rem; height: 2.75rem; flex: none; border: 1px solid #d8dce3; border-radius: .25rem; color: #0b1d3a; background: #fff; cursor: pointer; }
      .home-mobile-menu-toggle svg { width: 1.5rem; height: 1.5rem; }
      header nav[data-home-mobile-nav] { display: none !important; position: absolute !important; top: 100% !important; left: 0 !important; right: 0 !important; z-index: 50 !important; flex-direction: column !important; align-items: stretch !important; gap: 0 !important; padding: .5rem 1.5rem 1rem !important; border-top: 1px solid #e5e8ed !important; background: #fff !important; box-shadow: 0 12px 20px #0b1d3a1a !important; }
      header nav[data-home-mobile-nav][data-home-mobile-open="true"] { display: flex !important; }
      header nav[data-home-mobile-nav] > a { padding: .7rem 0 !important; }
      header nav[data-home-mobile-nav] > div.group > div { position: static !important; width: auto !important; padding: .15rem 0 .5rem 1rem !important; visibility: visible !important; opacity: 1 !important; transform: none !important; }
      header nav[data-home-mobile-nav] > div.group > div > div { border: 0 !important; background: transparent !important; box-shadow: none !important; }
      header nav[data-home-mobile-nav] > div.group > div > div > a { padding: .45rem 0 !important; }
    }
  `;
  document.head.append(menuStyles);

  const setMenuOpen = (open) => {
    homeNavigation.dataset.homeMobileOpen = String(open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  };

  toggle.addEventListener("click", () => {
    setMenuOpen(homeNavigation.dataset.homeMobileOpen !== "true");
  });
  homeNavigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (!homeNavigation.contains(event.target) && !toggle.contains(event.target)) setMenuOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", () => setMenuOpen(false));
}
window.addEventListener("load", setupHomeNavigation, { once: true });

if (!blogPreviewRoot) {
  console.error("Could not find the homepage main element for the blog preview.");
} else {
  window.addEventListener("load", async () => {
    try {
      const response = await fetch("assets/blog-preview.json");
      if (!response.ok) throw new Error(`Could not load the blog preview (${response.status})`);
      const posts = await response.json();
      if (!Array.isArray(posts) || posts.length === 0) throw new Error("The blog preview is empty or invalid");

      const section = document.createElement("section");
      section.className = "home-blog-preview";
      section.setAttribute("aria-labelledby", "home-blog-title");
      section.innerHTML = `
        <style>
          .home-blog-preview { background: #f6f7f9; padding: clamp(3.5rem, 8vw, 6.5rem) 1.5rem; }
          .home-blog-inner { width: min(80rem, 100%); margin: 0 auto; }
          .home-blog-heading { display: flex; justify-content: space-between; align-items: end; gap: 1.5rem; margin-bottom: 2rem; }
          .home-blog-kicker { color: #c8102e; font-size: .78rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
          .home-blog-heading h2 { color: #0b1d3a; font: 600 clamp(2rem, 4vw, 3rem)/1.15 "EB Garamond", Georgia, serif; margin: .45rem 0 0; }
          .home-blog-heading p { color: #596579; margin: .6rem 0 0; }
          .home-blog-all { color: #c8102e; font-weight: 650; text-decoration: none; white-space: nowrap; }
          .home-blog-all:hover, .home-blog-card-title:hover { text-decoration: underline; text-underline-offset: .2em; }
          .home-blog-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.25rem; }
          .home-blog-card { overflow: hidden; border: 1px solid #e5e8ed; border-radius: 12px; background: #fff; }
          .home-blog-image { display: block; aspect-ratio: 570 / 447; overflow: hidden; background: #edf0f4; }
          .home-blog-image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
          .home-blog-image:hover img { transform: scale(1.025); }
          .home-blog-copy { padding: 1.25rem; }
          .home-blog-meta { color: #596579; font-size: .82rem; margin: 0 0 .55rem; }
          .home-blog-category { color: #c8102e; font-weight: 650; }
          .home-blog-card-title { color: #0b1d3a; display: block; font: 600 1.45rem/1.22 "EB Garamond", Georgia, serif; text-decoration: none; }
          @media (max-width: 760px) {
            .home-blog-heading { align-items: flex-start; flex-direction: column; }
            .home-blog-grid { grid-template-columns: 1fr; }
          }
        </style>
        <div class="home-blog-inner">
          <div class="home-blog-heading">
            <div><span class="home-blog-kicker">Insights and guidance</span><h2 id="home-blog-title">From the blog</h2><p>Practical answers to common tax questions.</p></div>
            <a class="home-blog-all" href="blog/">View all articles →</a>
          </div>
          <div class="home-blog-grid"></div>
        </div>`;

      const grid = section.querySelector(".home-blog-grid");
      const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[char]);
      const cards = posts.slice(0, 3).map((post) => {
        const articleUrl = new URL(`blog/${encodeURIComponent(post.slug)}/`, document.baseURI).href;
        const imageUrl = new URL(post.image, document.baseURI).href;
        const date = new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" })
          .format(new Date(`${post.date.slice(0, 10)}T00:00:00`));
        return `<article class="home-blog-card">
          <a class="home-blog-image" href="${escapeHtml(articleUrl)}"><img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(post.alt || post.title)}" loading="lazy"></a>
          <div class="home-blog-copy">
            <p class="home-blog-meta"><span class="home-blog-category">${escapeHtml(post.category)}</span> · ${escapeHtml(date)}</p>
            <a class="home-blog-card-title" href="${escapeHtml(articleUrl)}">${escapeHtml(post.title)}</a>
          </div>
        </article>`;
      }).join("");
      grid.innerHTML = cards;
      blogPreviewRoot.append(section);
    } catch (error) {
      console.error(error);
    }
  }, { once: true });
}
