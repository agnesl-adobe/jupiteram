// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

/**
 * Fetches the nav fragment. Metadata-independent dual fetch:
 * /content/nav.plain.html (local preview) first, then /nav.plain.html (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Makes relative image paths in the fragment resolve against the fragment URL,
 * not the page URL.
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|\/)/.test(src)) img.src = new URL(src, base).href;
    img.loading = 'eager';
  });
}

/**
 * Works out what each top-level fragment section is from its content.
 */
function classifySection(section) {
  const links = section.querySelectorAll('a');
  if (section.querySelector('a img')) return 'brand';
  if (section.querySelector('ul ul') || links.length > 2) return 'sections';
  if (links.length === 0 && section.querySelector('ul')) return 'utility';
  return 'tools';
}

function closeAllDrops(navSections, except) {
  navSections.querySelectorAll('.nav-drop').forEach((drop) => {
    if (drop !== except) drop.setAttribute('aria-expanded', 'false');
  });
}

/**
 * Keeps an open desktop dropdown inside the viewport (shifts it left if it would overflow).
 */
function keepPanelInView(item) {
  const panel = item.querySelector(':scope > .nav-drop-panel');
  if (!panel) return;
  panel.style.removeProperty('transform');
  if (!isDesktop.matches || item.getAttribute('aria-expanded') !== 'true') return;
  const overflow = panel.getBoundingClientRect().right - (document.documentElement.clientWidth - 8);
  if (overflow > 0) panel.style.transform = `translateX(${-Math.ceil(overflow)}px)`;
}

function setHeaderOpen(nav) {
  const anyOpen = !!nav.querySelector('.nav-drop[aria-expanded="true"]');
  nav.closest('.nav-wrapper')?.classList.toggle('is-open', anyOpen && isDesktop.matches);
  nav.querySelectorAll('.nav-drop').forEach(keepPanelInView);
}

/**
 * Opens/closes the whole menu (mobile hamburger).
 */
function toggleMenu(nav, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  nav.closest('.nav-wrapper')?.classList.toggle('is-menu-open', !expanded && !isDesktop.matches);
  document.body.style.overflowY = (!expanded && !isDesktop.matches) ? 'hidden' : '';
  if (button) button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
}

/**
 * Turns the nav sections list into hover dropdowns (desktop) / expandable list (mobile).
 */
function decorateSections(nav, navSections) {
  const topItems = navSections.querySelectorAll(':scope > ul > li');
  topItems.forEach((item, i) => {
    const sub = item.querySelector(':scope > ul');
    const link = item.querySelector(':scope > a');
    if (!sub) return;
    item.classList.add('nav-drop');
    item.setAttribute('aria-expanded', 'false');
    sub.id = sub.id || `nav-drop-${i}`;
    const panel = document.createElement('div');
    panel.className = 'nav-drop-panel';
    sub.replaceWith(panel);
    panel.append(sub);

    if (link) {
      link.setAttribute('aria-haspopup', 'true');
      link.setAttribute('aria-controls', sub.id);
      // desktop: like the source, the heading opens its dropdown instead of navigating
      // (each dropdown starts with an "Overview" link to the section page)
      link.addEventListener('click', (e) => {
        if (!isDesktop.matches) return;
        e.preventDefault();
        closeAllDrops(navSections, item);
        item.setAttribute('aria-expanded', 'true');
        setHeaderOpen(nav);
      });
    }

    // expander for touch / keyboard / mobile
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'nav-drop-toggle';
    toggle.setAttribute('aria-label', `Show ${link ? link.textContent.trim() : 'submenu'} links`);
    toggle.setAttribute('aria-controls', sub.id);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = item.getAttribute('aria-expanded') === 'true';
      if (isDesktop.matches) closeAllDrops(navSections, item);
      item.setAttribute('aria-expanded', open ? 'false' : 'true');
      setHeaderOpen(nav);
    });
    item.insertBefore(toggle, panel);

    // desktop: open on hover
    item.addEventListener('mouseenter', () => {
      if (!isDesktop.matches) return;
      closeAllDrops(navSections, item);
      item.setAttribute('aria-expanded', 'true');
      setHeaderOpen(nav);
    });
    item.addEventListener('mouseleave', () => {
      if (!isDesktop.matches) return;
      item.setAttribute('aria-expanded', 'false');
      setHeaderOpen(nav);
    });
    item.addEventListener('focusout', (e) => {
      if (isDesktop.matches && !item.contains(e.relatedTarget)) {
        item.setAttribute('aria-expanded', 'false');
        setHeaderOpen(nav);
      }
    });
  });
}

/**
 * Builds the search form from the fragment's search link (href = results page, text = placeholder).
 */
function decorateSearch(navTools) {
  const link = navTools.querySelector('a');
  if (!link) return;
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.method = 'get';
  form.action = link.getAttribute('href');
  form.setAttribute('role', 'search');
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.required = true;
  input.placeholder = link.textContent.trim();
  input.id = 'nav-search-input';
  label.htmlFor = input.id;
  label.className = 'nav-search-label';
  label.textContent = link.textContent.trim();
  form.append(label, input);
  link.closest('p')?.replaceWith(form);
  if (!form.isConnected) navTools.append(form);
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navData = await fetchNav();
  block.textContent = '';
  if (!navData) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = navData.html;
  resolveImages(fragment, navData.base);

  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main');

  [...fragment.children].forEach((section) => {
    const type = classifySection(section);
    section.classList.add(`nav-${type}`);
    nav.append(section);
  });

  const navUtility = nav.querySelector('.nav-utility');
  const navBrand = nav.querySelector('.nav-brand');
  const navSections = nav.querySelector('.nav-sections');
  const navTools = nav.querySelector('.nav-tools');

  if (navBrand) navBrand.classList.add('nav-logo');
  if (navSections) decorateSections(nav, navSections);
  if (navTools) decorateSearch(navTools);

  // <nav> is the main row (brand + sections + tools); the utility row sits above it
  [navBrand, navSections, navTools].forEach((el) => { if (el) nav.append(el); });

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.className = 'nav-hamburger';
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav));
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  const navContainer = document.createElement('div');
  navContainer.className = 'nav-container';
  if (navUtility) navContainer.append(navUtility);
  navContainer.append(nav);

  window.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (navSections) closeAllDrops(navSections);
    setHeaderOpen(nav);
    if (!isDesktop.matches && nav.getAttribute('aria-expanded') === 'true') {
      toggleMenu(nav, false);
      hamburger.querySelector('button').focus();
    }
  });

  // reset state when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    toggleMenu(nav, false);
    if (navSections) closeAllDrops(navSections);
    setHeaderOpen(nav);
  });

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(navContainer);
  block.append(navWrapper);
}
