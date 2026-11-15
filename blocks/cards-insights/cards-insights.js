import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const isLinkOnly = (p) => {
  const a = p.querySelector('a');
  return !!a && p.textContent.trim() === a.textContent.trim();
};

function decorateBody(li, body) {
  const heading = body.querySelector(':scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6');

  // Paragraphs before the title hold the date and read time: group them on one line.
  if (heading) {
    heading.classList.add('cards-insights-card-title');
    const metas = [];
    let prev = heading.previousElementSibling;
    while (prev) {
      metas.unshift(prev);
      prev = prev.previousElementSibling;
    }
    if (metas.length) {
      const meta = document.createElement('div');
      meta.className = 'cards-insights-card-meta';
      metas.forEach((p, i) => {
        if (i === 0) p.classList.add('cards-insights-card-date');
        else p.classList.add('cards-insights-card-readtime');
        meta.append(p);
      });
      heading.before(meta);
    }
  }

  // The whole card is clickable through the primary link (stretched via CSS).
  const linkParas = [...body.querySelectorAll(':scope > p')].filter(isLinkOnly);
  const primary = heading?.querySelector('a[href]') || linkParas[0]?.querySelector('a[href]');
  if (primary) {
    primary.classList.add('cards-insights-card-link');
    li.classList.add('cards-insights-card-linked');
    const primaryPara = primary.closest('p');
    if (primaryPara && !heading?.contains(primary)) primaryPara.classList.add('cards-insights-card-cta');
  }

  // After the title: the author paragraph(s), then the last short paragraph is the tag pill
  // (with or without a link).
  const after = [];
  let next = heading?.nextElementSibling;
  while (next) {
    if (next.tagName === 'P' && !next.classList.contains('cards-insights-card-cta')) after.push(next);
    next = next.nextElementSibling;
  }
  if (after.length) {
    const last = after[after.length - 1];
    const isTag = isLinkOnly(last) || (after.length > 1 && last.textContent.trim().length <= 40);
    if (isTag) last.classList.add('cards-insights-card-tag');
    after.filter((p) => p !== last || !isTag).forEach((p) => p.classList.add('cards-insights-card-author'));
  }
}

// TEMPORARY (quick fix): card photos for these articles, used only when the card's own image
// is missing or broken in the authored content (their images were lost in AEM author).
// Remove once the photos are added to the cards in AEM author.
const FALLBACK_CARD_IMAGES = {
  '/uk/en/individual/insights/merlin-weekly-macro-europe-middle-powers-fight-for-relevance/':
    'https://www.jupiteram.com/adobe/dynamicmedia/deliver/dm-aid--98526a0a-cdd9-433f-b522-31ee4ee7ce39/Merlin13.10.2026.jpg.webp?preferwebp=true',
  '/uk/en/individual/insights/merlin-weekly-macro-trump-trumped-what-now/':
    'https://www.jupiteram.com/content/dam/jupiteram/insights/Hero_Images_Half%20Overlay-Merlin-06.11.2026.jpg/_jcr_content/renditions/cq5dam.web.1280.1280.jpeg',
  '/uk/en/individual/insights/merlin-weekly-macro-a-complacent-budget-courts-fiscal-crisis/':
    'https://www.jupiteram.com/adobe/dynamicmedia/deliver/dm-aid--54c55d5e-fba9-4896-a4bb-569878835c4b/30.10.26-C-328-Merlin-Weekly-Macro-IMAGE-TILE.jpg.webp?preferwebp=true',
};

const isBrokenSrc = (src) => !src || src.startsWith('about:');

/**
 * Gives a card its fallback photo when the authored image is missing or broken.
 */
function applyFallbackImage(li) {
  const link = li.querySelector('.cards-insights-card-link');
  if (!link) return;
  const fallback = FALLBACK_CARD_IMAGES[new URL(link.href, window.location.href).pathname];
  if (!fallback) return;
  let cell = li.querySelector('.cards-insights-card-image');
  const img = cell?.querySelector('img');
  if (img && !isBrokenSrc(img.getAttribute('src'))) return;
  if (!cell) {
    cell = document.createElement('div');
    li.prepend(cell);
  }
  const picture = document.createElement('picture');
  const fresh = document.createElement('img');
  fresh.src = fallback;
  fresh.alt = img?.alt || '';
  fresh.loading = 'lazy';
  picture.append(fresh);
  cell.replaceChildren(picture);
  cell.className = 'cards-insights-card-image';
}

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-insights-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      const hasText = !!cell.textContent.trim();
      if (hasPicture && !hasText) cell.className = 'cards-insights-card-image';
      else if (!hasPicture && !hasText) cell.className = 'cards-insights-card-image cards-insights-card-image-empty';
      else cell.className = 'cards-insights-card-body';
    });

    const body = li.querySelector('.cards-insights-card-body');
    if (body) decorateBody(li, body);
    applyFallbackImage(li);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
  block.replaceChildren(ul);

  // A tag pill without its own link sits above the stretched link (so it can show its hover
  // state); forward its clicks to the card link so the whole card stays clickable.
  block.addEventListener('click', (e) => {
    const tag = e.target.closest('.cards-insights-card-tag');
    if (!tag || e.target.closest('a')) return;
    const link = tag.closest('.cards-insights-card')?.querySelector('.cards-insights-card-link');
    if (link) link.click();
  });
}
