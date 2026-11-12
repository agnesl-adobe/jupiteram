/* eslint-disable */
/* global WebImporter */

/**
 * Dynamic Media / Scene7 image transformer for jupiteram.com
 * (s7g10.scene7.com/is/image/JupiterAsset/...).
 *
 * afterTransform only: parsers need real <img> nodes before this runs.
 * Rewrites DM <img> elements into anchors that survive the markdown round-trip:
 *   - Unlinked image: <a href="DM-URL">alt-or-sentinel</a>
 *   - Linked image (img is sole meaningful content of an <a>): keep the
 *     navigation href, move the DM URL to title, replace content with alt text.
 *   - Mixed-content anchors are skipped (warned).
 * The client-side auto-block in scripts/scripts.js converts them back to <picture>.
 */

// Must stay byte-identical with the scripts.js auto-block sentinel.
const EMPTY_ALT_SENTINEL = 'Image without alt text';

function altToLinkText(alt) {
  return alt || EMPTY_ALT_SENTINEL;
}

function detectDynamicMediaUrl(urlStr) {
  if (typeof urlStr !== 'string') return false;
  if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
  let u;
  try {
    u = new URL(urlStr, 'https://x/');
  } catch (e) {
    return false;
  }
  if (u.pathname.startsWith('/is/image/')) return 'scene7';
  if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname)
      && u.pathname.startsWith('/adobe/assets/urn:')) {
    return 'dm-openapi';
  }
  return false;
}

const LINKED_DM_INLINE_WRAPPER_TAGS = new Set(['PICTURE']);
const LINKED_DM_WRAPPER_SIBLING_TAGS = new Set(['SOURCE']);

// Returns the wrapping <a> when the image (optionally inside <picture>) is
// its sole meaningful content; otherwise null.
function findLinkedDmCarrier(img) {
  if (!img || !img.parentElement) return null;
  let node = img;
  let parent = img.parentElement;
  while (parent && LINKED_DM_INLINE_WRAPPER_TAGS.has(parent.tagName)) {
    let foundNode = false;
    for (const child of parent.children) {
      if (child === node) {
        foundNode = true;
      } else if (!LINKED_DM_WRAPPER_SIBLING_TAGS.has(child.tagName)) {
        return null;
      }
    }
    if (!foundNode) return null;
    node = parent;
    parent = parent.parentElement;
  }
  if (!parent || parent.tagName !== 'A') return null;
  if (parent.children.length !== 1 || parent.children[0] !== node) return null;
  if (parent.textContent.trim() !== '') return null;
  return parent;
}

function resolveDmSrc(img) {
  const candidates = [
    img.getAttribute('src'),
    img.getAttribute('data-src'),
    img.getAttribute('data-cmp-src'),
  ];
  for (const c of candidates) {
    if (c && detectDynamicMediaUrl(c)) return c;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;

  const document = element.ownerDocument;

  element.querySelectorAll('img').forEach((img) => {
    const dmUrl = resolveDmSrc(img);
    if (!dmUrl) return;

    const linkText = altToLinkText((img.getAttribute('alt') || '').trim());

    const carrier = findLinkedDmCarrier(img);
    if (carrier) {
      // Linked image: keep navigation href, DM URL goes to title.
      carrier.setAttribute('title', dmUrl);
      carrier.textContent = linkText;
      return;
    }

    const enclosingAnchor = img.closest('a');
    if (enclosingAnchor) {
      // Mixed-content anchor (image plus text/other elements): leave as-is.
      console.warn(`[jupiteram-dm-images] Skipping DM image inside mixed-content anchor: ${dmUrl}`);
      return;
    }

    // Unlinked image: replace (img or its <picture> wrapper) with an anchor.
    const a = document.createElement('a');
    a.setAttribute('href', dmUrl);
    a.textContent = linkText;

    const picture = img.parentElement && img.parentElement.tagName === 'PICTURE'
      ? img.parentElement
      : null;
    if (picture && [...picture.children].every((c) => c === img || c.tagName === 'SOURCE')) {
      picture.replaceWith(a);
    } else {
      img.replaceWith(a);
    }
  });
}
