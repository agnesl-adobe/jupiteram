import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const ARROW_PATHS = {
  prev: 'M20.3125 26.8809L25.3125 21.8809C25.6875 21.4746 26.3437 21.4746 26.7187 21.8809C27.125 22.2559 27.125 22.9121 26.7187 23.2871L23.4375 26.5996L33 26.5996C33.5625 26.5996 34 27.0371 34 27.5996C34 28.1309 33.5625 28.5996 33 28.5996L23.4375 28.5996L26.7187 31.8809C27.125 32.2559 27.125 32.9121 26.7187 33.2871C26.3437 33.6934 25.6875 33.6934 25.3125 33.2871L20.3125 28.2871C19.9062 27.9121 19.9062 27.2559 20.3125 26.8809Z',
  next: 'M33.6875 28.3184L28.6875 33.3184C28.3125 33.7246 27.6562 33.7246 27.2812 33.3184C26.875 32.9434 26.875 32.2871 27.2812 31.9121L30.5625 28.5996H21C20.4375 28.5996 20 28.1621 20 27.5996C20 27.0684 20.4375 26.5996 21 26.5996H30.5625L27.2812 23.3184C26.875 22.9434 26.875 22.2871 27.2812 21.9121C27.6562 21.5059 28.3125 21.5059 28.6875 21.9121L33.6875 26.9121C34.0938 27.2871 34.0938 27.9434 33.6875 28.3184Z',
};

function arrowButton(dir, label, controls) {
  return `<button type="button" class="carousel-promo-${dir}" aria-label="${label}" aria-controls="${controls}">
    <svg viewBox="0 0 54 55" width="54" height="55" aria-hidden="true" focusable="false">
      <circle class="carousel-promo-arrow-ring" cx="27" cy="27.6" r="26"/>
      <path class="carousel-promo-arrow-glyph" d="${ARROW_PATHS[dir]}"/>
    </svg>
  </button>`;
}

function updateActiveSlide(block, slideIndex) {
  block.dataset.activeSlide = slideIndex;
  const slides = block.querySelectorAll('.carousel-promo-slide');
  slides.forEach((slide, idx) => {
    const active = idx === slideIndex;
    slide.classList.toggle('carousel-promo-slide-active', active);
    slide.setAttribute('aria-hidden', !active);
    slide.querySelectorAll('a, button').forEach((el) => {
      if (active) el.removeAttribute('tabindex');
      else el.setAttribute('tabindex', '-1');
    });
  });
  const status = block.querySelector('.carousel-promo-status');
  if (status) status.textContent = `Slide ${slideIndex + 1} of ${slides.length}`;
}

export function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-promo-slide');
  if (!slides.length) return;
  let index = slideIndex;
  if (index < 0) index = slides.length - 1;
  if (index >= slides.length) index = 0;
  updateActiveSlide(block, index);
}

function bindEvents(block) {
  const current = () => parseInt(block.dataset.activeSlide || '0', 10);
  block.querySelector('.carousel-promo-navigation-buttons').addEventListener('click', (e) => {
    if (e.target.closest('.carousel-promo-prev')) showSlide(block, current() - 1);
    else if (e.target.closest('.carousel-promo-next')) showSlide(block, current() + 1);
  });
}

/* Each slide ends in a call-to-action link; render it as the site's primary pill button. */
function decorateCta(content) {
  content.querySelectorAll('p > a[href]').forEach((a) => {
    const p = a.parentElement;
    if (a.classList.contains('button') || p.textContent.trim() !== a.textContent.trim()) return;
    p.classList.add('button-wrapper');
    a.classList.add('button', 'primary');
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.id = `carousel-promo-${carouselId}-slide-${slideIndex}`;
  slide.className = 'carousel-promo-slide';
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');

  [...row.children].forEach((cell) => {
    const hasPicture = !!cell.querySelector('picture');
    const hasText = !!cell.textContent.trim();
    // Slides are text-led: drop an empty image cell instead of leaving a gap.
    if (!hasPicture && !hasText) {
      cell.remove();
      return;
    }
    const isImage = hasPicture && !hasText;
    cell.classList.add(isImage ? 'carousel-promo-slide-image' : 'carousel-promo-slide-content');
    if (!isImage) decorateCta(cell);
    slide.append(cell);
  });
  if (slide.querySelector('.carousel-promo-slide-image')) slide.classList.add('carousel-promo-slide-has-image');

  const heading = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    if (!heading.id) heading.id = `${slide.id}-title`;
    slide.setAttribute('aria-labelledby', heading.id);
  }

  slide.querySelectorAll('picture > img').forEach((img) => {
    const url = new URL(img.src, window.location.href);
    if (url.origin !== window.location.origin || /\.svg$/i.test(url.pathname)) return;
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    img.closest('picture').replaceWith(optimized);
  });
  return slide;
}

let carouselId = 0;
export default async function decorate(block) {
  carouselId += 1;
  block.id = `carousel-promo-${carouselId}`;
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'Carousel');

  const rows = [...block.children];
  const isSingleSlide = rows.length < 2;

  const container = document.createElement('div');
  container.className = 'carousel-promo-slides-container';
  const slides = document.createElement('ul');
  slides.className = 'carousel-promo-slides';
  container.append(slides);

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    moveInstrumentation(row, slide);
    slides.append(slide);
    row.remove();
  });

  block.replaceChildren(container);

  if (!isSingleSlide) {
    const nav = document.createElement('div');
    nav.className = 'carousel-promo-navigation-buttons';
    nav.innerHTML = `
      ${arrowButton('prev', 'Previous slide', block.id)}
      ${arrowButton('next', 'Next slide', block.id)}
      <span class="carousel-promo-status" aria-live="polite"></span>
    `;
    block.append(nav);
    bindEvents(block);
  }
  updateActiveSlide(block, 0);
}
