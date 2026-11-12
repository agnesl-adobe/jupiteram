import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const firstRow = block.firstElementChild;
  const cols = firstRow ? [...firstRow.children] : [];
  block.classList.add(`columns-teaser-${cols.length}-cols`);

  [...block.children].forEach((row) => {
    row.classList.add('columns-teaser-row');
    [...row.children].forEach((col, idx) => {
      const pic = col.querySelector('picture');
      if (pic && !col.textContent.trim()) {
        col.classList.add('columns-teaser-img-col');
        // Authored cell order sets the side; record it so mobile can stack image first.
        row.classList.add(idx === 0 ? 'columns-teaser-image-first' : 'columns-teaser-image-last');
      } else {
        col.classList.add('columns-teaser-text-col');
        // A paragraph holding only a link is the teaser CTA: render it as a primary button.
        col.querySelectorAll(':scope > p').forEach((p) => {
          const a = p.querySelector(':scope > a[href]');
          if (!a || p.children.length !== 1) return;
          if (p.textContent.trim() !== a.textContent.trim()) return;
          p.classList.add('button-wrapper');
          a.classList.add('button', 'primary');
        });
      }
    });
  });

  block.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}
