/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-individual.js
  var import_individual_exports = {};
  __export(import_individual_exports, {
    default: () => import_individual_default
  });

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    slides.forEach((slide, index) => {
      const img = slide.querySelector(".cmp-hero--image img, img");
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3");
      const description = slide.querySelector(".cmp-teaser__description");
      const ctas = Array.from(slide.querySelectorAll(".cmp-teaser__action-container a[href], .cmp-hero--buttons a[href]"));
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:media_image "));
        imageFrag.appendChild(img);
      }
      const textFrag = document.createDocumentFragment();
      const textNodes = [];
      if (title) {
        const heading = document.createElement(index === 0 ? "h1" : "h2");
        heading.textContent = title.textContent.replace(/\s+/g, " ").trim();
        textNodes.push(heading);
      }
      if (description) {
        const paras = Array.from(description.querySelectorAll("p"));
        if (paras.length) {
          paras.forEach((p) => textNodes.push(p));
        } else if (description.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = description.textContent.trim();
          textNodes.push(p);
        }
      }
      const seen = /* @__PURE__ */ new Set();
      ctas.forEach((a) => {
        if (seen.has(a)) return;
        seen.add(a);
        const p = document.createElement("p");
        p.appendChild(a);
        textNodes.push(p);
      });
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:content_text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/search-fund-finder.js
  var DEFAULT_FUND_INDEX = "/data/funds.json";
  var DEFAULT_ALL_FUNDS_HREF = "/uk/en/individual/fund-centre/";
  function parse2(element, { document }) {
    const form = element.matches("form") ? element : element.querySelector("form#fundFinder, form.fund-finder-form, form") || element;
    const cells = [];
    const introHeading = form.querySelector("h1, h2, h3, h4");
    if (introHeading && introHeading.textContent.trim()) {
      const textFrag = document.createDocumentFragment();
      textFrag.appendChild(document.createComment(" field:text "));
      const h = document.createElement("h2");
      h.textContent = introHeading.textContent.trim();
      textFrag.appendChild(h);
      cells.push([textFrag]);
    } else {
      cells.push([""]);
    }
    const dataAttr = form.getAttribute("data-source") || form.getAttribute("data-url") || form.getAttribute("action");
    const index = dataAttr && /\.json(\?|$)/i.test(dataAttr) ? dataAttr : DEFAULT_FUND_INDEX;
    const indexFrag = document.createDocumentFragment();
    indexFrag.appendChild(document.createComment(" field:index "));
    indexFrag.appendChild(document.createTextNode(index));
    cells.push([indexFrag]);
    const allFunds = form.querySelector("#view-all-funds, .view-all-funds");
    const allFundsAnchor = form.querySelector("a.view-all-funds, .view-all-funds a[href]");
    const linkText = allFunds && allFunds.textContent.trim() || "View all funds";
    const href = allFundsAnchor && allFundsAnchor.getAttribute("href") || allFunds && allFunds.getAttribute("data-href") || DEFAULT_ALL_FUNDS_HREF;
    const linkFrag = document.createDocumentFragment();
    linkFrag.appendChild(document.createComment(" field:link "));
    const a = document.createElement("a");
    a.setAttribute("href", href);
    a.textContent = linkText;
    linkFrag.appendChild(a);
    cells.push([linkFrag]);
    const block = WebImporter.Blocks.createBlock(document, { name: "search-fund-finder", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-promo.js
  function parse3(element, { document }) {
    const slides = Array.from(element.querySelectorAll(".cmp-carousel__item"));
    const cells = [];
    slides.forEach((slide) => {
      const img = slide.querySelector(".cmp-contentblock--image img, .cmp-image img, img");
      const title = slide.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
      const description = slide.querySelector(".cmp-teaser__description");
      const ctas = Array.from(slide.querySelectorAll(".cmp-teaser__action-container a[href]"));
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:media_image "));
        imageFrag.appendChild(img);
      }
      const textNodes = [];
      if (title && title.textContent.trim()) {
        const h = document.createElement("h2");
        h.textContent = title.textContent.replace(/\s+/g, " ").trim();
        textNodes.push(h);
      }
      if (description) {
        const paras = Array.from(description.querySelectorAll("p"));
        if (paras.length) {
          paras.forEach((p) => textNodes.push(p));
        } else if (description.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = description.textContent.trim();
          textNodes.push(p);
        }
      }
      ctas.forEach((a) => {
        a.querySelectorAll(".cmp-link__screen-reader-only").forEach((s) => s.remove());
        const link = document.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = a.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
        p.appendChild(link);
        textNodes.push(p);
      });
      const textFrag = document.createDocumentFragment();
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:content_text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "carousel-promo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-info.js
  function parse4(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > .cmp-cards--cardItems"));
    if (!items.length) items = Array.from(element.querySelectorAll(".default-item"));
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".default-item__image-container img, img");
      const content = item.querySelector(".default-item__content-text") || item;
      const ctas = Array.from(item.querySelectorAll(".default-item__content-and-button > a[href]"));
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textNodes = Array.from(content.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol")).filter((n) => n.textContent.trim());
      ctas.forEach((a) => {
        const link = document.createElement("a");
        link.setAttribute("href", a.getAttribute("href"));
        link.textContent = a.textContent.replace(/\s+/g, " ").trim();
        const p = document.createElement("p");
        p.appendChild(link);
        textNodes.push(p);
      });
      const textFrag = document.createDocumentFragment();
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-info", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-teaser.js
  var TEASER_SELECTOR = ".contentblock.teaser.cmp-contentblock--promoSmall";
  function buildText(teaser, document) {
    const nodes = [];
    const title = teaser.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    if (title && title.textContent.trim()) {
      const h = document.createElement("h2");
      h.textContent = title.textContent.replace(/\s+/g, " ").trim();
      nodes.push(h);
    }
    const description = teaser.querySelector(".cmp-teaser__description");
    if (description) {
      const paras = Array.from(description.querySelectorAll(":scope > p"));
      if (!paras.length && description.textContent.trim()) {
        const p = document.createElement("p");
        p.textContent = description.textContent.replace(/\s+/g, " ").trim();
        nodes.push(p);
      }
      paras.forEach((p) => {
        const first = Array.from(p.childNodes).find((n) => n.nodeType !== 3 || n.textContent.trim());
        if (first && first.nodeType === 1 && /^(B|STRONG)$/.test(first.tagName)) {
          const name = first.textContent.replace(/\s+/g, " ").trim();
          first.remove();
          if (name) {
            const nameP = document.createElement("p");
            const strong = document.createElement("strong");
            strong.textContent = name;
            nameP.appendChild(strong);
            nodes.push(nameP);
          }
          p.querySelectorAll("br").forEach((br) => {
            if (!br.previousSibling || !br.previousSibling.textContent.trim()) br.remove();
          });
          const rest = p.textContent.replace(/\s+/g, " ").trim();
          if (rest) {
            const restP = document.createElement("p");
            restP.textContent = rest;
            nodes.push(restP);
          }
        } else if (p.textContent.trim()) {
          nodes.push(p);
        }
      });
    }
    teaser.querySelectorAll(".cmp-teaser__action-container a[href]").forEach((a) => {
      a.querySelectorAll(".cmp-link__screen-reader-only").forEach((s) => s.remove());
      const link = document.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = a.textContent.replace(/\s+/g, " ").trim();
      const p = document.createElement("p");
      p.appendChild(link);
      nodes.push(p);
    });
    return nodes;
  }
  function parse5(element, { document }) {
    if (!element.parentNode) return;
    const teasers = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(TEASER_SELECTOR)) {
      teasers.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    teasers.forEach((teaser) => {
      const img = teaser.querySelector(".cmp-contentblock--image img, .cmp-image img, img");
      const imageCell = img ? [img] : "";
      const textNodes = buildText(teaser, document);
      const textCell = textNodes.length ? textNodes : "";
      const imageRight = teaser.classList.contains("cmp-contentblock--imageRight");
      cells.push(imageRight ? [textCell, imageCell] : [imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-teaser", cells });
    teasers.slice(1).forEach((t) => t.remove());
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse6(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > .cmp-cards--cardItems"));
    if (!items.length) items = Array.from(element.querySelectorAll(".insight-item"));
    const cells = [];
    const textOf = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
    const para = (text) => {
      const p = document.createElement("p");
      p.textContent = text;
      return p;
    };
    items.forEach((item) => {
      const cardLink = item.querySelector(".insight-item > a[href], a[href]");
      const href = cardLink ? cardLink.getAttribute("href") : "";
      const img = item.querySelector(".insight-item__image-container img, img");
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textNodes = [];
      const date = textOf(item.querySelector(".insight-item__content__public-date"));
      if (date) textNodes.push(para(date));
      const readTime = textOf(item.querySelector(".insight-item__content__reading_time"));
      if (readTime) textNodes.push(para(readTime));
      const title = item.querySelector(".insight-item__content-text-and-tags h1, .insight-item__content-text-and-tags h2, .insight-item__content-text-and-tags h3, .insight-item__content-text-and-tags h4, .insight-item__content-text-and-tags h5, .insight-item__content-text-and-tags h6");
      if (title && textOf(title)) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = textOf(title);
          h.appendChild(a);
        } else {
          h.textContent = textOf(title);
        }
        textNodes.push(h);
      }
      const author = textOf(item.querySelector(".insight-item__content__languange-and-author"));
      if (author) textNodes.push(para(author));
      item.querySelectorAll(".insight-item__content-text li").forEach((li) => {
        const tagLink = li.querySelector("a[href]");
        const label = textOf(li);
        if (!label) return;
        if (tagLink) {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.setAttribute("href", tagLink.getAttribute("href"));
          a.textContent = label;
          p.appendChild(a);
          textNodes.push(p);
        } else {
          textNodes.push(para(label));
        }
      });
      const textFrag = document.createDocumentFragment();
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-insights", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/jupiteram-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        "#jam-header",
        "#header",
        ".cmp-attestation-form",
        "footer.experiencefragment"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#onetrust-banner-sdk",
        "#onetrust-pc-sdk",
        ".onetrust-pc-dark-filter",
        ".ot-floating-button__back"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#cce-chat-widget",
        "#id_cce_chat_container",
        ".chat-button.cce_button",
        "#fc_frame",
        "#fc_widget"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".cmp-carousel__actions",
        ".cmp-carousel__indicators",
        ".biography-item__arrow-container"
      ]);
    }
    if (hookName === "afterTransform") {
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "iframe",
        "link"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          const name = attr.name;
          if (name.startsWith("data-cmp-") || name.startsWith("data-analytics") || name === "onclick") {
            el.removeAttribute(name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/jupiteram-dm-images.js
  var EMPTY_ALT_SENTINEL = "Image without alt text";
  function altToLinkText(alt) {
    return alt || EMPTY_ALT_SENTINEL;
  }
  function detectDynamicMediaUrl(urlStr) {
    if (typeof urlStr !== "string") return false;
    if (!/^(https?:\/\/|\/\/)/i.test(urlStr)) return false;
    let u;
    try {
      u = new URL(urlStr, "https://x/");
    } catch (e) {
      return false;
    }
    if (u.pathname.startsWith("/is/image/")) return "scene7";
    if (/^delivery-p\d+-e\d+\.adobeaemcloud\.com$/.test(u.hostname) && u.pathname.startsWith("/adobe/assets/urn:")) {
      return "dm-openapi";
    }
    return false;
  }
  var LINKED_DM_INLINE_WRAPPER_TAGS = /* @__PURE__ */ new Set(["PICTURE"]);
  var LINKED_DM_WRAPPER_SIBLING_TAGS = /* @__PURE__ */ new Set(["SOURCE"]);
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
    if (!parent || parent.tagName !== "A") return null;
    if (parent.children.length !== 1 || parent.children[0] !== node) return null;
    if (parent.textContent.trim() !== "") return null;
    return parent;
  }
  function resolveDmSrc(img) {
    const candidates = [
      img.getAttribute("src"),
      img.getAttribute("data-src"),
      img.getAttribute("data-cmp-src")
    ];
    for (const c of candidates) {
      if (c && detectDynamicMediaUrl(c)) return c;
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    if (hookName !== "afterTransform") return;
    const document = element.ownerDocument;
    element.querySelectorAll("img").forEach((img) => {
      const dmUrl = resolveDmSrc(img);
      if (!dmUrl) return;
      const linkText = altToLinkText((img.getAttribute("alt") || "").trim());
      const carrier = findLinkedDmCarrier(img);
      if (carrier) {
        carrier.setAttribute("title", dmUrl);
        carrier.textContent = linkText;
        return;
      }
      const enclosingAnchor = img.closest("a");
      if (enclosingAnchor) {
        console.warn(`[jupiteram-dm-images] Skipping DM image inside mixed-content anchor: ${dmUrl}`);
        return;
      }
      const a = document.createElement("a");
      a.setAttribute("href", dmUrl);
      a.textContent = linkText;
      const picture = img.parentElement && img.parentElement.tagName === "PICTURE" ? img.parentElement : null;
      if (picture && [...picture.children].every((c) => c === img || c.tagName === "SOURCE")) {
        picture.replaceWith(a);
      } else {
        img.replaceWith(a);
      }
    });
  }

  // tools/importer/transformers/jupiteram-sections.js
  var MARKER_ATTR = "data-excat-section-id";
  var FIRST_ATTR = "data-excat-first-section";
  function findSectionElement(root, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function isSectionBreak(node) {
    return node && node.nodeType === 1 && node.tagName === "HR";
  }
  function transform3(hookName, element, payload) {
    const template = payload && payload.template;
    const sections = template && Array.isArray(template.sections) ? template.sections : [];
    if (sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSectionElement(element, section);
        if (!el || !el.parentNode) continue;
        if (i === 0) {
          if (section.style) {
            const hr2 = document.createElement("hr");
            hr2.setAttribute(MARKER_ATTR, section.id);
            hr2.setAttribute(FIRST_ATTR, "true");
            el.parentNode.insertBefore(hr2, el);
          }
          continue;
        }
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(MARKER_ATTR, section.id);
        el.parentNode.insertBefore(hr, el);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`hr[${MARKER_ATTR}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (marker) {
          let cursor = marker.nextSibling;
          let nextBreak = null;
          while (cursor) {
            if (isSectionBreak(cursor)) {
              nextBreak = cursor;
              break;
            }
            cursor = cursor.nextSibling;
          }
          if (nextBreak) {
            nextBreak.parentNode.insertBefore(metadata, nextBreak);
          } else {
            marker.parentNode.appendChild(metadata);
          }
          if (marker.hasAttribute(FIRST_ATTR)) {
            marker.remove();
          } else {
            marker.removeAttribute(MARKER_ATTR);
          }
        } else {
          const el = findSectionElement(element, section);
          if (el && el.parentNode) {
            el.parentNode.insertBefore(metadata, el.nextSibling);
          }
        }
      }
    }
  }

  // tools/importer/import-individual.js
  var PAGE_TEMPLATE = {
    "name": "individual",
    "urls": [
      "https://www.jupiteram.com/uk/en/individual/"
    ],
    "representativeUrl": "https://www.jupiteram.com/uk/en/individual/",
    "description": "Individual investor landing page: hero carousel, important notice, fund finder with promo slider, help cards, fund teasers and related insights",
    "urlPattern": "/uk/en/*",
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          ".carousel.panelcontainer.cmp-hero--kaleBright",
          ".carousel.panelcontainer"
        ]
      },
      {
        "name": "search-fund-finder",
        "instances": [
          ".cmp-fund-finder .form-container",
          "form#fundFinder.fund-finder-form"
        ]
      },
      {
        "name": "carousel-promo",
        "instances": [
          ".cmp-carousel.cmp-contentblock__carousel",
          ".cmp-fund-finder .non-form-container .cmp-carousel"
        ]
      },
      {
        "name": "cards-info",
        "instances": [
          ".cmp-cards.defaultList",
          ".cards.list.cmp-cards--borderlessBlue .cmp-cards"
        ]
      },
      {
        "name": "columns-teaser",
        "instances": [
          ".contentblock.teaser.cmp-contentblock--promoSmall"
        ]
      },
      {
        "name": "cards-insights",
        "instances": [
          ".cmp-cards.insightsList"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "Hero carousel",
        "selector": [
          ".carousel.panelcontainer.cmp-hero--kaleBright",
          ".carousel.panelcontainer"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Important information notice",
        "selector": [
          ".text.carpo-bright-50"
        ],
        "style": "pale-blue",
        "blocks": [],
        "defaultContent": [
          ".text.carpo-bright-50 .cmp-text"
        ]
      },
      {
        "id": "section-3",
        "name": "Fund finder and MyJupiter promo",
        "selector": [
          ".fundfinder",
          ".cmp-fund-finder"
        ],
        "style": "light-blue",
        "blocks": [
          "search-fund-finder",
          "carousel-promo"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Help cards, fund teasers and related insights",
        "selector": [
          ".cards.list.cmp-cards--borderlessBlue"
        ],
        "style": null,
        "blocks": [
          "cards-info",
          "columns-teaser",
          "cards-insights"
        ],
        "defaultContent": [
          ".cards.list .cmp-cards-container > .cmp-text"
        ]
      }
    ]
  };
  var parsers = {
    "carousel-hero": parse,
    "search-fund-finder": parse2,
    "carousel-promo": parse3,
    "cards-info": parse4,
    "columns-teaser": parse5,
    "cards-insights": parse6
  };
  var sectionTransformers = [transform3];
  var fragmentTransformers = [];
  var lateTransformers = [...sectionTransformers, ...fragmentTransformers];
  var transformers = [transform, transform2, ...lateTransformers];
  var earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
  var CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));
  function executeTransformers(hookName, element, payload, list = transformers) {
    var _a, _b;
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: ((_b = (_a = payload.params) == null ? void 0 : _a.targets) == null ? void 0 : _b.template) || PAGE_TEMPLATE });
    list.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template, url) {
    const pageBlocks = [];
    const pageKey = (u) => {
      try {
        const { origin, pathname } = new URL(u);
        return `${origin}${pathname.replace(/\/$/, "")}`;
      } catch (e) {
        return u;
      }
    };
    const key = pageKey(url);
    const claim = (blockDef, selector) => {
      let matches = [];
      try {
        matches = document.querySelectorAll(selector);
      } catch (e) {
        return;
      }
      matches.forEach((element) => {
        if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    };
    template.blocks.forEach((blockDef) => {
      const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
      (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
    });
    template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
    return pageBlocks;
  }
  function markPageTargets(payload) {
    const { document, params } = payload;
    executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
    const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
      element.setAttribute("data-excat-block", String(i));
      return { name, selector };
    });
    const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
      const target = (section.selector || []).map((s) => {
        try {
          return document.querySelector(s);
        } catch (e) {
          return null;
        }
      }).find(Boolean);
      if (!target) return section;
      target.setAttribute("data-excat-section", String(i));
      return __spreadProps(__spreadValues({}, section), { selector: [`[data-excat-section="${i}"]`] });
    });
    params.targets = { blocks, template: __spreadProps(__spreadValues({}, PAGE_TEMPLATE), { sections }) };
  }
  var import_individual_default = {
    preprocess: (payload) => {
      if (CATALOG) markPageTargets(payload);
    },
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      params.fragments = [];
      if (!params.targets) markPageTargets(payload);
      const pageBlocks = params.targets.blocks.map((block, i) => __spreadProps(__spreadValues({}, block), { element: document.querySelector(`[data-excat-block="${i}"]`) })).filter((block) => block.element);
      executeTransformers("beforeTransform", main, __spreadProps(__spreadValues({}, payload), { pageBlocks }), lateTransformers);
      pageBlocks.forEach((block) => {
        if (!main.contains(block.element)) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      params.fragments.forEach(({ element }) => {
        executeTransformers("afterTransform", element, payload, earlyTransformers);
        WebImporter.rules.transformBackgroundImages(element, document);
        WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
      });
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }, ...params.fragments];
    }
  };
  return __toCommonJS(import_individual_exports);
})();
