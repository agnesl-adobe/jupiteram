import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    li.className = 'cards-info-card';
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      const hasText = !!cell.textContent.trim();
      if (hasPicture && !hasText) {
        cell.className = 'cards-info-card-image';
      } else if (!hasPicture && !hasText) {
        // Text-only cards keep an empty image cell in the content; hide it.
        cell.className = 'cards-info-card-image cards-info-card-image-empty';
      } else {
        cell.className = 'cards-info-card-body';
        // The trailing link paragraph is the card CTA, pinned to the bottom and
        // rendered as a primary button (authored links are not bold).
        const last = cell.lastElementChild;
        const a = last && last.querySelector(':scope > a[href], :scope > strong > a[href]');
        if (a && last.textContent.trim() === a.textContent.trim()) {
          last.classList.add('cards-info-card-cta', 'button-wrapper');
          a.classList.add('button', 'primary');
        }
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
}
