import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Home of the breadcrumb: page metadata wins, otherwise the locale/audience root
// (e.g. /uk/en/individual/) when the page sits below it.
function getHomePath() {
  const fromMeta = getMetadata('breadcrumb-home');
  if (fromMeta) return fromMeta;
  const segments = window.location.pathname.split('/').filter(Boolean);
  return segments.length > 3 ? `/${segments.slice(0, 3).join('/')}/` : '/';
}

// Breadcrumb is navigation, not authored content: Home > current page title.
function buildBreadcrumb(heading) {
  const nav = document.createElement('nav');
  nav.className = 'hero-offset-photo-breadcrumb';
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');

  const home = document.createElement('li');
  const homeLink = document.createElement('a');
  homeLink.href = getHomePath();
  homeLink.textContent = 'Home';
  home.append(homeLink);

  const current = document.createElement('li');
  current.setAttribute('aria-current', 'page');
  current.textContent = (heading?.textContent || getMetadata('og:title') || document.title)
    .trim().replace(/\.$/, '');

  ol.append(home, current);
  nav.append(ol);
  return nav;
}

// The trailing full stop is brand styling: colour an authored one, or add it.
function decorateHeadingDot(heading) {
  const span = document.createElement('span');
  span.className = 'hero-offset-photo-dot';
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let last;
  while (walker.nextNode()) last = walker.currentNode;
  if (last && /\.\s*$/.test(last.textContent)) {
    const dot = last.splitText(last.textContent.lastIndexOf('.'));
    dot.splitText(1);
    dot.replaceWith(span);
    span.append(dot);
  } else {
    span.setAttribute('aria-hidden', 'true');
    span.textContent = '.';
    heading.append(span);
  }
}

export default function decorate(block) {
  const rows = [...block.children];
  const picture = block.querySelector('picture');
  const textCell = rows
    .map((row) => row.firstElementChild)
    .find((cell) => cell && cell.textContent.trim() && !cell.querySelector('picture'));

  const media = document.createElement('div');
  media.className = 'hero-offset-photo-media';
  if (picture) {
    const imageCell = picture.closest('.hero-offset-photo > div > div');
    if (imageCell) moveInstrumentation(imageCell, media);
    const img = picture.querySelector('img');
    const url = img ? new URL(img.src, window.location.href) : null;
    if (url && url.origin === window.location.origin && !/\.svg$/i.test(url.pathname)) {
      const optimized = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
      moveInstrumentation(img, optimized.querySelector('img'));
      media.append(optimized);
    } else {
      if (img) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }
      media.append(picture);
    }
  } else {
    media.classList.add('hero-offset-photo-media-empty');
  }

  const content = document.createElement('div');
  content.className = 'hero-offset-photo-content';
  if (textCell) {
    moveInstrumentation(textCell, content);
    content.append(...textCell.childNodes);
  }
  const heading = content.querySelector('h1, h2');
  if (heading) decorateHeadingDot(heading);
  content.prepend(buildBreadcrumb(heading));

  block.replaceChildren(media, content);
}
