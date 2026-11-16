import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// The trailing link-only paragraph is the card CTA, pinned to the card bottom.
function decorateCta(body) {
  const last = body.lastElementChild;
  const a = last && last.querySelector(':scope > a[href], :scope > strong > a[href]');
  if (!a || last.textContent.trim() !== a.textContent.trim()) return;
  last.classList.add('cards-circular-card-cta', 'button-wrapper');
  a.classList.remove('secondary');
  a.classList.add('button', 'primary');
}

// Below 900px the source shows one card at a time with prev/next arrows.
function buildSlider(block, ul) {
  const nav = document.createElement('div');
  nav.className = 'cards-circular-nav';
  const makeButton = (dir, label) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `cards-circular-${dir}`;
    button.setAttribute('aria-label', label);
    button.setAttribute('aria-controls', ul.id);
    button.addEventListener('click', () => {
      const card = ul.querySelector('.cards-circular-card');
      const step = card ? card.getBoundingClientRect().width : ul.clientWidth;
      ul.scrollBy({ left: dir === 'prev' ? -step : step, behavior: 'smooth' });
    });
    return button;
  };
  const prev = makeButton('prev', 'Previous card');
  const next = makeButton('next', 'Next card');
  nav.append(prev, next);

  const update = () => {
    const max = ul.scrollWidth - ul.clientWidth - 1;
    prev.disabled = ul.scrollLeft <= 0;
    next.disabled = ul.scrollLeft >= max;
  };
  ul.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  requestAnimationFrame(update);
  block.append(nav);
}

let counter = 0;

export default function decorate(block) {
  const ul = document.createElement('ul');
  counter += 1;
  ul.id = `cards-circular-track-${counter}`;
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-circular-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      const hasText = !!cell.textContent.trim();
      if (hasPicture && !hasText) {
        cell.className = 'cards-circular-card-image';
      } else if (!hasPicture && !hasText) {
        cell.className = 'cards-circular-card-image cards-circular-card-image-empty';
      } else {
        cell.className = 'cards-circular-card-body';
        // spacer headings with no text are layout leftovers
        cell.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
          if (!h.textContent.trim()) h.remove();
        });
        decorateCta(cell);
      }
    });
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
  if (ul.children.length > 1) buildSlider(block, ul);
}
