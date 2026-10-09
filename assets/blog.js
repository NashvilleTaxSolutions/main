const app = document.getElementById("app");
const currentPath = location.pathname.replace(/\/+$/, "");
const blogPathIndex = currentPath.lastIndexOf("/blog/");
const postSlug = blogPathIndex === -1 ? "" : currentPath.slice(blogPathIndex + 6);
const pageSize = 10;
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
})[char]);
const decodeHtml = (value) => new DOMParser().parseFromString(value, "text/html").documentElement.textContent;
const linkTo = (path) => new URL(path, document.baseURI).href;

const styles = `
  :root { color-scheme: light; --blog-navy: #0b1d3a; --blog-red: #c8102e; --blog-ink: #27364d; --blog-muted: #596579; --blog-line: #e5e8ed; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #fff; color: var(--blog-ink); font-family: Inter, Arial, sans-serif; line-height: 1.65; }
  a { color: inherit; }
  .blog-header { border-bottom: 1px solid var(--blog-line); background: #fff; }
  .blog-topline { background: var(--blog-navy); color: #fff; text-align: center; padding: .55rem 1rem; font-size: .875rem; }
  .blog-topline a { color: #fff; font-weight: 600; margin-left: .6rem; }
  .blog-nav-wrap { width: min(1120px, calc(100% - 2rem)); margin: auto; min-height: 88px; display: flex; align-items: center; justify-content: space-between; gap: 1.5rem; }
  .blog-brand img { width: 225px; max-width: 42vw; height: auto; display: block; }
  .blog-nav { display: flex; flex-wrap: wrap; gap: .6rem 1.05rem; justify-content: flex-end; }
  .blog-nav a { text-decoration: none; font-size: .92rem; font-weight: 550; }
  .blog-nav a:hover, .blog-nav a[aria-current="page"] { color: var(--blog-red); }
  .blog-main { width: min(1120px, calc(100% - 2rem)); margin: 0 auto; }
  .blog-hero { padding: clamp(2.75rem, 7vw, 5.25rem) 0 2.5rem; max-width: 850px; }
  .blog-eyebrow { color: var(--blog-red); text-transform: uppercase; letter-spacing: .12em; font-size: .78rem; font-weight: 700; }
  .blog-hero h1, .blog-post h1 { color: var(--blog-navy); font-family: "EB Garamond", Georgia, serif; font-weight: 600; font-size: clamp(2.5rem, 5vw, 4rem); line-height: 1.12; letter-spacing: -.025em; margin: .75rem 0 1rem; }
  .blog-intro { font-size: clamp(1.08rem, 2vw, 1.25rem); color: var(--blog-muted); margin: 0; }
  .blog-grid { border-top: 1px solid var(--blog-line); padding: 2.25rem 0 4rem; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2rem 1.5rem; }
  .blog-card { min-width: 0; border: 1px solid var(--blog-line); border-radius: 12px; overflow: hidden; background: #fff; }
  .blog-card-image { display: block; overflow: hidden; background: #f2f4f7; aspect-ratio: 570 / 447; }
  .blog-card-image img { display: block; width: 100%; height: 100%; object-fit: cover; transition: transform .25s ease; }
  .blog-card-image:hover img { transform: scale(1.025); }
  .blog-card-body { padding: 1.3rem 1.4rem 1.45rem; position: relative; }
  .blog-meta { display: flex; flex-wrap: wrap; gap: .4rem .8rem; align-items: center; color: var(--blog-muted); font-size: .82rem; margin: 0 0 .6rem; }
  .blog-category { color: var(--blog-red); font-weight: 650; }
  .blog-card h2 { color: var(--blog-navy); font: 600 1.45rem/1.22 "EB Garamond", Georgia, serif; margin: 0; }
  .blog-card h2 a { text-decoration: none; }
  .blog-card h2 a:hover { color: var(--blog-red); }
  .blog-date-badge { position: absolute; right: 1.25rem; top: -2.85rem; width: 3.3rem; padding: .35rem .2rem; background: #fff; color: var(--blog-navy); text-align: center; box-shadow: 0 2px 10px #0b1d3a22; font-size: .7rem; line-height: 1.1; text-transform: uppercase; }
  .blog-date-badge strong { display: block; font-size: 1.25rem; line-height: 1.1; }
  .blog-pagination { grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--blog-line); padding-top: 1.5rem; }
  .blog-pagination a, .blog-back { color: var(--blog-red); font-weight: 650; text-decoration: none; }
  .blog-pagination a:hover, .blog-back:hover { text-decoration: underline; }
  .blog-post { border-top: 1px solid var(--blog-line); padding: 2rem 0 4rem; max-width: 900px; margin: 0 auto; }
  .blog-post-header { margin-bottom: 1.75rem; }
  .blog-post h1 { font-size: clamp(2.25rem, 4vw, 3.5rem); margin: .7rem 0 1rem; }
  .blog-post-image { display: block; width: 100%; max-height: 560px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 10px; margin: 1.5rem 0 2rem; }
  .post-content { color: var(--blog-ink); overflow-wrap: anywhere; }
  .post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5, .post-content h6 { color: var(--blog-navy); font-family: "EB Garamond", Georgia, serif; line-height: 1.25; margin: 1.8rem 0 .7rem; }
  .post-content h1 { font-size: 2rem; }
  .post-content h2 { font-size: 1.8rem; }
  .post-content h3 { font-size: 1.5rem; }
  .post-content h4, .post-content h5, .post-content h6 { font-size: 1.25rem; }
  .post-content p { color: var(--blog-muted); margin: 0 0 1rem; }
  .post-content ul, .post-content ol { padding-left: 1.5rem; margin: 0 0 1.25rem; }
  .post-content ul { list-style: disc; }
  .post-content ol { list-style: decimal; }
  .post-content li { color: var(--blog-muted); padding-left: .2rem; margin: .35rem 0; }
  .post-content a { color: var(--blog-red); text-decoration: underline; text-underline-offset: .15em; }
  .post-content table { display: block; max-width: 100%; overflow-x: auto; border-collapse: collapse; margin: 1.4rem 0; }
  .post-content th, .post-content td { border: 1px solid var(--blog-line); padding: .65rem .8rem; text-align: left; }
  .post-content th { color: var(--blog-navy); background: #f5f7fa; }
  .post-content details { border: 1px solid var(--blog-line); border-radius: 8px; padding: .85rem 1rem; margin: .7rem 0; }
  .post-content summary { cursor: pointer; color: var(--blog-navy); font-weight: 650; }
  .post-content details > div { padding-top: .7rem; }
  .post-content blockquote { border-left: 3px solid var(--blog-red); padding-left: 1rem; margin: 1.25rem 0; color: var(--blog-muted); }
  .blog-footer { background: var(--blog-navy); color: #fff; padding: 2rem 1rem; }
  .blog-footer-inner { width: min(1120px, 100%); margin: auto; display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; flex-wrap: wrap; }
  .blog-footer-inner p { margin: 0; color: #e7ebf1; }
  .blog-footer-links { display: flex; gap: 1rem; flex-wrap: wrap; }
  .blog-footer-links a { color: #fff; }
  .blog-error { padding: 2rem 0; color: #8b1e2d; }
  @media (max-width: 760px) {
    .blog-nav-wrap { align-items: flex-start; flex-direction: column; padding: 1rem 0; gap: .75rem; }
    .blog-nav { justify-content: flex-start; }
    .blog-brand img { width: 190px; }
    .blog-grid { grid-template-columns: 1fr; gap: 1.25rem; }
    .blog-pagination { grid-column: 1; }
    .blog-card-body { padding: 1.1rem; }
  }
`;

const routes = [
  ["Home", "./"],
  ["About", "about/"],
  ["Our Team", "our-team/"],
  ["Services", "services/"],
  ["Blog", "blog/"],
  ["FAQ", "faq/"],
  ["Community", "community/"],
  ["Contact", "contact/"]
];
const localRouteAliases = {
  "about-us": "about/",
  "contact-us": "contact/",
  "business-advisory-services": "services/business-advisory/",
  "tax-resolution-services": "services/tax-resolution/",
  "service/back-taxes": "services/tax-resolution/",
  "service/compliance-advisory-services": "services/compliance-services/",
  "service/filing-payroll-taxes": "services/payroll-tax-returns/",
  "service/florida-tax-help": "services/tax-resolution/",
  "service/hardship-tax-relief": "services/tax-resolution/",
  "service/innocent-spouse-relief": "services/tax-resolution/",
  "service/irs-collection-notice": "services/tax-resolution/",
  "service/irs-tax-audit": "services/tax-resolution/",
  "service/irs-tax-levy": "services/tax-resolution/",
  "service/irs-tax-lien": "services/tax-resolution/",
  "service/offer-in-compromise": "services/tax-resolution/",
  "service/payment-plan-with-irs": "services/tax-resolution/",
  "service/tax-preparation-services": "services/tax-preparation/"
};

function renderFrame(content) {
  const links = routes.map(([label, path]) =>
    `<a href="${escapeHtml(path)}"${label === "Blog" ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("");
  app.innerHTML = `
    <style>${styles}</style>
    <header class="blog-header">
      <div class="blog-topline">Serious tax matters require more than generic advice. <a href="contact/">Start a conversation →</a></div>
      <div class="blog-nav-wrap">
        <a class="blog-brand" href="./" aria-label="Nashville Tax Solutions home"><img src="assets/main-company-logo.webp" alt="Nashville Tax Solutions"></a>
        <nav class="blog-nav" aria-label="Main navigation">${links}</nav>
      </div>
    </header>
    ${content}
    <footer class="blog-footer"><div class="blog-footer-inner"><p>Nashville Tax Solutions</p><div class="blog-footer-links"><a href="privacy/">Privacy</a><a href="terms/">Terms</a><a href="contact/">Contact</a></div></div></footer>`;
}

function formatDate(date) {
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00`);
  return new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long", day: "numeric" }).format(parsed);
}

function postUrl(slug) {
  return linkTo(`blog/${encodeURIComponent(slug)}/`);
}

function renderArchive(posts) {
  const requestedPage = Number(new URLSearchParams(location.search).get("page") || "1");
  const pageCount = Math.ceil(posts.length / pageSize);
  const pageNumber = Number.isInteger(requestedPage) ? Math.min(Math.max(requestedPage, 1), pageCount) : 1;
  const start = (pageNumber - 1) * pageSize;
  const shownPosts = posts.slice(start, start + pageSize);
  const cards = shownPosts.map((post) => {
    const title = decodeHtml(post.title);
    const date = new Date(`${post.date.slice(0, 10)}T00:00:00`);
    const day = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date);
    const month = new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    return `<article class="blog-card">
      <a class="blog-card-image" href="${escapeHtml(postUrl(post.slug))}"><img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.alt || title)}" loading="lazy"></a>
      <div class="blog-card-body">
        <div class="blog-date-badge"><strong>${day}</strong>${month}</div>
        <p class="blog-meta"><span>by ${escapeHtml(post.author)}</span><span aria-hidden="true">·</span><span class="blog-category">${escapeHtml(post.category)}</span></p>
        <h2><a href="${escapeHtml(postUrl(post.slug))}">${escapeHtml(title)}</a></h2>
      </div>
    </article>`;
  }).join("");
  const previous = pageNumber > 1 ? `<a href="?page=${pageNumber - 1}" rel="prev">← Newer posts</a>` : "<span></span>";
  const next = pageNumber < pageCount ? `<a href="?page=${pageNumber + 1}" rel="next">Older posts →</a>` : "<span></span>";
  document.title = "Discover Top Tax Resolution Blogs! Expert Tips for Tax Troubles — Nashville Tax Solutions";
  renderFrame(`<main class="blog-main">
    <section class="blog-hero"><div class="blog-eyebrow">Nashville Tax Solutions</div><h1>Discover Top Tax Resolution Blogs! Expert Tips for Tax Troubles</h1><p class="blog-intro">Practical guidance and answers to common questions about tax resolution and business taxes.</p></section>
    <section class="blog-grid" aria-label="Tax resolution blog posts">${cards}<nav class="blog-pagination" aria-label="Blog pages">${previous}<span>Page ${pageNumber} of ${pageCount}</span>${next}</nav></section>
  </main>`);
}

function localizeInternalLink(href, posts) {
  if (!href) return "";
  if (href.startsWith("#")) return href;
  let url;
  try {
    url = new URL(href, "https://nashvilletaxsolutions.com/");
  } catch {
    return "";
  }
  if (!["http:", "https:"].includes(url.protocol)) return "";
  if (!["nashvilletaxsolutions.com", "www.nashvilletaxsolutions.com"].includes(url.hostname)) return url.href;

  const path = url.pathname.replace(/^\/+|\/+$/g, "");
  const slug = path.replace(/\/$/, "");
  if (posts.some((post) => post.slug === slug)) return postUrl(slug);
  if (localRouteAliases[path]) return linkTo(localRouteAliases[path]);
  if (path === "blog") return linkTo("blog/");
  if (["about", "our-team", "services", "faq", "community", "contact", "privacy", "terms"].includes(path) || path.startsWith("services/")) {
    return linkTo(`${path}/`);
  }
  return url.href;
}

function sanitizeArticle(content, posts) {
  const parsed = new DOMParser().parseFromString(content, "text/html");
  parsed.querySelectorAll("script, style, iframe, object, embed, form, input, textarea, select").forEach((node) => node.remove());

  parsed.querySelectorAll(".accordion-item").forEach((item) => {
    const button = item.querySelector("button.accordion-button");
    const target = button?.getAttribute("data-bs-target");
    const answer = target?.startsWith("#") ? parsed.getElementById(target.slice(1)) : null;
    if (!button || !answer) return;
    const details = parsed.createElement("details");
    const summary = parsed.createElement("summary");
    const body = parsed.createElement("div");
    summary.textContent = button.textContent.trim();
    const answerBody = answer.querySelector(".accordion-body") || answer;
    while (answerBody.firstChild) body.append(answerBody.firstChild);
    details.append(summary, body);
    item.replaceWith(details);
  });

  const allowedTags = new Set(["A", "B", "BLOCKQUOTE", "BR", "CODE", "DIV", "DETAILS", "EM", "FIGCAPTION", "FIGURE", "H1", "H2", "H3", "H4", "H5", "H6", "HR", "I", "LI", "OL", "P", "PRE", "S", "SMALL", "SPAN", "STRONG", "SUMMARY", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "U", "UL"]);
  [...parsed.body.querySelectorAll("*")].reverse().forEach((node) => {
    if (!allowedTags.has(node.tagName)) {
      node.replaceWith(...node.childNodes);
      return;
    }
    [...node.attributes].forEach((attribute) => {
      if (node.tagName !== "A" || !["href", "title"].includes(attribute.name.toLowerCase())) {
        node.removeAttribute(attribute.name);
      }
    });
    if (node.tagName === "A") {
      const href = localizeInternalLink(node.getAttribute("href"), posts);
      if (href) {
        node.setAttribute("href", href);
        if (new URL(href, location.href).origin !== location.origin) {
          node.setAttribute("target", "_blank");
          node.setAttribute("rel", "noopener noreferrer");
        }
      } else {
        node.removeAttribute("href");
      }
    }
  });
  return parsed.body.innerHTML;
}

function renderPost(posts, post) {
  const title = decodeHtml(post.title);
  document.title = `${title} — Nashville Tax Solutions`;
  const description = document.querySelector('meta[name="description"]');
  if (description) description.content = decodeHtml(post.excerpt).replace(/\s+/g, " ").trim().slice(0, 155);
  const category = escapeHtml(post.category);
  renderFrame(`<main class="blog-main">
    <article class="blog-post">
      <a class="blog-back" href="blog/">← All blog posts</a>
      <header class="blog-post-header">
        <p class="blog-meta"><span>by ${escapeHtml(post.author)}</span><span aria-hidden="true">·</span><span class="blog-category">${category}</span><span aria-hidden="true">·</span><time datetime="${escapeHtml(post.date.slice(0, 10))}">${escapeHtml(formatDate(post.date))}</time></p>
        <h1>${escapeHtml(title)}</h1>
      </header>
      <img class="blog-post-image" src="${escapeHtml(post.image)}" alt="${escapeHtml(post.alt || title)}">
      <div class="post-content">${sanitizeArticle(post.content, posts)}</div>
    </article>
  </main>`);
}

if (app) {
  fetch("assets/blog-posts.json")
    .then((response) => {
      if (!response.ok) throw new Error(`Could not load blog posts (${response.status})`);
      return response.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts) || posts.length === 0) throw new Error("The blog post archive is empty or invalid");
      if (postSlug) {
        const post = posts.find((entry) => entry.slug === postSlug);
        if (!post) {
          renderFrame('<main class="blog-main"><p class="blog-error">This blog post could not be found. <a href="blog/">Return to the blog archive.</a></p></main>');
          document.title = "Blog post not found — Nashville Tax Solutions";
          return;
        }
        renderPost(posts, post);
      } else {
        renderArchive(posts);
      }
    })
    .catch((error) => {
      console.error(error);
      renderFrame('<main class="blog-main"><p class="blog-error">Blog posts could not be loaded. Please try again later.</p></main>');
    });
}
