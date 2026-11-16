import { loadCSS } from '../../scripts/aem.js';
import decorateTeaser from '../columns-teaser/columns-teaser.js';

/**
 * A Columns block authored with teaser content (every row: one image-only cell next to
 * one text cell ending in a link) renders like the Columns Teaser block.
 */
function isTeaserContent(block) {
  const rows = [...block.children];
  return rows.length > 0 && rows.every((row) => {
    const cells = [...row.children];
    if (cells.length !== 2) return false;
    const imageCells = cells.filter((c) => c.querySelector('picture') && !c.textContent.trim());
    const textCells = cells.filter((c) => c.textContent.trim() && c.querySelector('a[href]'));
    return imageCells.length === 1 && textCells.length === 1;
  });
}

export default async function decorate(block) {
  if (isTeaserContent(block)) {
    await loadCSS(`${window.hlx.codeBasePath}/blocks/columns-teaser/columns-teaser.css`);
    block.classList.replace('columns', 'columns-teaser');
    block.parentElement?.classList.add('columns-teaser-wrapper');
    decorateTeaser(block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
