/**
 * Fetches the footer fragment. Metadata-independent dual fetch:
 * /content/footer.plain.html (local preview) first, then /footer.plain.html (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Makes relative image paths resolve against the fragment URL, not the page URL.
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    const src = img.getAttribute('src');
    if (!/^(https?:|data:|about:|\/)/.test(src)) img.src = new URL(src, base || window.location.href).href;
    img.loading = 'lazy';
  });
}

const FALLBACK_LOGO = '/icons/jupiter-footer-logo.png';
const FALLBACK_LABEL_ICON = '/icons/globe-dark.svg';
const isBrokenSrc = (src) => !src || src.startsWith('about:');

/**
 * Normalizes the fragment shape: authoring tools may wrap list item content in <p>.
 */
function normalizeFragment(root) {
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
}

/**
 * Uses a fallback for broken or failing images (about:error placeholders, failed loads).
 */
function useFallbackImage(img, fallback) {
  if (isBrokenSrc(img.getAttribute('src'))) img.src = fallback;
  img.addEventListener('error', () => {
    if (!img.src.endsWith(fallback)) img.src = fallback;
  }, { once: true });
}

/**
 * Social links whose icon image is missing get the icon named after the network's domain,
 * e.g. a uk.linkedin.com link uses the linkedin.svg icon from the code base.
 */
function ensureSocialIcon(link) {
  let img = link.querySelector('img');
  const network = new URL(link.href).hostname.split('.').slice(-2)[0];
  if (!img) {
    img = document.createElement('img');
    img.alt = network.charAt(0).toUpperCase() + network.slice(1);
    img.loading = 'lazy';
    link.append(img);
  }
  useFallbackImage(img, `/icons/${network}.svg`);
}

/**
 * Works out what each top-level fragment section is from its content.
 */
function classifySection(section) {
  if (section.querySelector('h1, h2, h3, h4, h5, h6') && section.querySelector('ul a')) return 'column';
  if (section.querySelector('img') || [...section.querySelectorAll('a')].some((a) => !a.textContent.trim())) return 'brand';
  const text = section.textContent.trim();
  if (section.querySelectorAll('p').length === 1 && text.length < 120) return 'copyright';
  return 'legal';
}

/**
 * Tags parts of the brand column (logo, labels, call-to-action, social links) by what they contain.
 */
function decorateBrand(brand) {
  [...brand.children].forEach((el) => {
    const link = el.querySelector('a');
    if (el.tagName === 'UL') {
      el.classList.add('footer-labels');
      el.querySelectorAll('img').forEach((img) => useFallbackImage(img, FALLBACK_LABEL_ICON));
    } else if (link && (link.querySelector('img') || !link.textContent.trim())) {
      el.classList.add('footer-social');
      ensureSocialIcon(link);
    } else if (link) {
      el.classList.add('footer-cta');
    } else if (el.querySelector('img')) {
      el.classList.add('footer-logo');
      useFallbackImage(el.querySelector('img'), FALLBACK_LOGO);
    }
  });
}

/**
 * Links that leave the site (absolute URLs to another origin) get the external-link marker.
 */
function markExternalLinks(scope) {
  scope.querySelectorAll('a[href^="http"]').forEach((a) => {
    if (new URL(a.href).origin !== window.location.origin) a.classList.add('external');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const data = await fetchFooter();
  block.textContent = '';
  if (!data) return;

  const fragment = document.createElement('div');
  fragment.innerHTML = data.html;
  normalizeFragment(fragment);
  resolveImages(fragment, data.base);

  const top = document.createElement('div');
  top.className = 'footer-top';
  const columns = document.createElement('div');
  columns.className = 'footer-columns';
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';

  [...fragment.children].forEach((section) => {
    const type = classifySection(section);
    section.classList.add(`footer-${type}`);
    if (type === 'brand') {
      decorateBrand(section);
      top.prepend(section);
    } else if (type === 'column') {
      markExternalLinks(section);
      columns.append(section);
    } else {
      bottom.append(section);
    }
  });
  top.append(columns);

  // any other broken image placeholder is removed rather than shown broken
  [top, bottom].forEach((el) => el.querySelectorAll('img').forEach((img) => {
    if (isBrokenSrc(img.getAttribute('src'))) img.remove();
  }));

  const inner = document.createElement('div');
  inner.append(top, bottom);
  block.append(inner);
}
