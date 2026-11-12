import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const AUTOPLAY_DELAY = 6000;

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  block.querySelectorAll('.carousel-hero-slide').forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  block.querySelectorAll('.carousel-hero-slide-indicator button').forEach((button, idx) => {
    if (idx === slideIndex) {
      button.setAttribute('aria-current', 'true');
      button.disabled = true;
    } else {
      button.removeAttribute('aria-current');
      button.disabled = false;
    }
  });
}

export function showSlide(block, slideIndex = 0, behavior = 'smooth') {
  const slides = block.querySelectorAll('.carousel-hero-slide');
  if (!slides.length) return;
  let index = slideIndex;
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  block.querySelector('.carousel-hero-slides').scrollTo({
    top: 0,
    left: slides[index].offsetLeft,
    behavior,
  });
  updateActiveSlide(block, index);
}

function bindEvents(block) {
  block.querySelectorAll('.carousel-hero-slide-indicator button').forEach((button) => {
    button.addEventListener('click', () => {
      showSlide(block, parseInt(button.parentElement.dataset.targetSlide, 10));
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block, parseInt(entry.target.dataset.slideIndex, 10));
      }
    });
  }, { threshold: 0.5 });
  block.querySelectorAll('.carousel-hero-slide').forEach((slide) => observer.observe(slide));

  // Autoplay, paused on hover/focus and disabled for reduced motion or in the editor.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const inEditor = document.documentElement.classList.contains('adobe-ue-edit');
  if (reduceMotion || inEditor) return;
  let paused = false;
  ['mouseenter', 'focusin'].forEach((evt) => block.addEventListener(evt, () => { paused = true; }));
  ['mouseleave', 'focusout'].forEach((evt) => block.addEventListener(evt, () => { paused = false; }));
  setInterval(() => {
    if (paused || document.hidden) return;
    showSlide(block, parseInt(block.dataset.activeSlide || '0', 10) + 1);
  }, AUTOPLAY_DELAY);
}

// Scene7 pads renditions wider than the master (1920px) with white side bars,
// so cap the desktop rendition at the width the source site requests.
const SCENE7_MAX_WIDTH = 1600;
function capScene7Width(slide) {
  slide.querySelectorAll('picture source, picture img').forEach((el) => {
    const attr = el.tagName === 'IMG' ? 'src' : 'srcset';
    const value = el.getAttribute(attr);
    if (!value || !value.includes('scene7.com')) return;
    const capped = value.replace(/([?&]wid=)(\d+)/, (m, key, wid) => `${key}${Math.min(Number(wid), SCENE7_MAX_WIDTH)}`);
    if (capped !== value) el.setAttribute(attr, capped);
  });
}

function optimizeImages(slide) {
  capScene7Width(slide);
  slide.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [
      { media: '(min-width: 900px)', width: '2000' },
      { width: '900' },
    ]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
}

// Colour the trailing full stop of the slide heading (brand accent).
function decorateHeadingDot(heading) {
  const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  let last;
  while (walker.nextNode()) last = walker.currentNode;
  if (!last || !/\.\s*$/.test(last.textContent)) return;
  const dot = last.splitText(last.textContent.lastIndexOf('.'));
  dot.splitText(1);
  const span = document.createElement('span');
  span.className = 'carousel-hero-dot';
  dot.replaceWith(span);
  span.append(dot);
}

// A paragraph holding only a link is the slide CTA: render it as a primary button.
function decorateCta(content) {
  content.querySelectorAll(':scope > p').forEach((p) => {
    const a = p.querySelector(':scope > a[href]');
    if (!a || p.children.length !== 1 || p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('button-wrapper');
    a.classList.add('button', 'primary');
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-hero-${carouselId}-slide-${slideIndex}`;
  slide.className = 'carousel-hero-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  [...row.children].forEach((cell) => {
    const hasOnlyPicture = cell.querySelector('picture') && !cell.textContent.trim();
    cell.classList.add(hasOnlyPicture ? 'carousel-hero-slide-image' : 'carousel-hero-slide-content');
    slide.append(cell);
  });

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
    decorateHeadingDot(heading);
  }
  slide.querySelectorAll('.carousel-hero-slide-content').forEach(decorateCta);

  // Only the first slide is the LCP candidate.
  if (slideIndex > 0) {
    slide.querySelectorAll('img').forEach((img) => img.setAttribute('loading', 'lazy'));
  }
  optimizeImages(slide);
  if (slideIndex === 0) {
    slide.querySelectorAll('img').forEach((img) => {
      img.setAttribute('loading', 'eager');
      img.setAttribute('fetchpriority', 'high');
    });
  }
  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-hero-${carouselId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  const container = document.createElement('div');
  container.className = 'carousel-hero-slides-container';
  const slides = document.createElement('ul');
  slides.className = 'carousel-hero-slides';

  let indicators;
  if (!isSingleSlide) {
    const nav = document.createElement('nav');
    nav.className = 'carousel-hero-slide-nav';
    nav.setAttribute('aria-label', 'Carousel slide controls');
    indicators = document.createElement('ol');
    indicators.className = 'carousel-hero-slide-indicators';
    nav.append(indicators);
    container.append(nav);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slides.append(slide);
    if (indicators) {
      const indicator = document.createElement('li');
      indicator.className = 'carousel-hero-slide-indicator';
      indicator.dataset.targetSlide = idx;
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-controls', slide.id);
      button.setAttribute('aria-label', `Show slide ${idx + 1} of ${rows.length}`);
      indicator.append(button);
      indicators.append(indicator);
    }
    row.remove();
  });

  container.prepend(slides);
  block.replaceChildren(container);

  if (!isSingleSlide) {
    updateActiveSlide(block, 0);
    bindEvents(block);
  }
}
