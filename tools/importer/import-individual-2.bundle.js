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

  // tools/importer/import-individual-2.js
  var import_individual_2_exports = {};
  __export(import_individual_2_exports, {
    default: () => import_individual_2_default
  });

  // tools/importer/parsers/hero-offset-photo.js
  function parse(element, { document }) {
    const img = element.querySelector(".cmp-hero--image img, .cmp-image img");
    const content = element.querySelector(".cmp-hero--content") || element;
    const imageFrag = document.createDocumentFragment();
    if (img) {
      imageFrag.appendChild(document.createComment(" field:image "));
      imageFrag.appendChild(img);
    }
    const textNodes = [];
    const title = content.querySelector("h1, h2, .cmp-teaser__title");
    if (title) {
      const text = title.textContent.replace(/\s+/g, " ").trim().replace(/\s*\.$/, "");
      if (text) {
        const h1 = document.createElement("h1");
        h1.textContent = text;
        textNodes.push(h1);
      }
    }
    content.querySelectorAll(".cmp-teaser__description p, .cmp-teaser__description").forEach((n) => {
      if (n.matches(".cmp-teaser__description") && n.querySelector("p")) return;
      const text = n.textContent.replace(/\s+/g, " ").trim();
      if (!text) return;
      const p = document.createElement("p");
      p.textContent = text;
      textNodes.push(p);
    });
    content.querySelectorAll(".cmp-teaser__action-container a[href]").forEach((a) => {
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
    const cells = [[imageFrag], [textFrag]];
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-offset-photo", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-circular.js
  var textOf = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  function buildText(item, document) {
    const nodes = [];
    const content = item.querySelector(".cmp-card__content-text");
    if (content) {
      Array.from(content.children).forEach((child) => {
        const tag = child.tagName;
        const text = textOf(child);
        if (!text) return;
        if (/^H[56]$/.test(tag)) {
          const p = document.createElement("p");
          const em = document.createElement("em");
          em.textContent = text;
          p.appendChild(em);
          nodes.push(p);
        } else if (/^H[1-4]$/.test(tag)) {
          const h = document.createElement(tag.toLowerCase());
          h.textContent = text;
          nodes.push(h);
        } else if (/^(P|UL|OL)$/.test(tag)) {
          nodes.push(child);
        }
      });
    }
    item.querySelectorAll("a.cmp-card__content-button[href]").forEach((a) => {
      const label = textOf(a);
      if (!label) return;
      const link = document.createElement("a");
      link.setAttribute("href", a.getAttribute("href"));
      link.textContent = label;
      const p = document.createElement("p");
      p.appendChild(link);
      nodes.push(p);
    });
    return nodes;
  }
  function parse2(element, { document }) {
    const items = Array.from(element.querySelectorAll(".cmp-card"));
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".cmp-card-image-container img, img");
      const imageFrag = document.createDocumentFragment();
      if (img) {
        img.removeAttribute("title");
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textNodes = buildText(item, document);
      const textFrag = document.createDocumentFragment();
      if (textNodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        textNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([imageFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-circular", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-info.js
  function parse3(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > .cmp-cards--cardItems"));
    if (!items.length) items = Array.from(element.querySelectorAll(".default-item"));
    if (!items.length) items = Array.from(element.querySelectorAll(".cmp-card"));
    const cells = [];
    items.forEach((item) => {
      const img = item.querySelector(".default-item__image-container img, .cmp-card-image-container img, img");
      const content = item.querySelector(".default-item__content-text, .cmp-card__content-text") || item;
      const ctas = Array.from(item.querySelectorAll(".default-item__content-and-button > a[href], a.cmp-card__content-button[href]"));
      const imageFrag = document.createDocumentFragment();
      if (img) {
        imageFrag.appendChild(document.createComment(" field:image "));
        imageFrag.appendChild(img);
      }
      const textNodes = Array.from(content.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol")).filter((n) => n.textContent.trim()).map((n) => {
        if (!/^H[56]$/.test(n.tagName)) return n;
        const p = document.createElement("p");
        const em = document.createElement("em");
        em.textContent = n.textContent.replace(/\s+/g, " ").trim();
        p.appendChild(em);
        return p;
      });
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

  // tools/importer/parsers/accordion-bordered.js
  function parse4(element, { document }) {
    Array.from(element.children).forEach((child) => {
      if (child.classList.contains("cmp-accordion__item")) return;
      if (child.textContent.trim() || child.querySelector("img")) {
        element.before(child);
      } else {
        child.remove();
      }
    });
    const items = Array.from(element.querySelectorAll(":scope > .cmp-accordion__item"));
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button") || item.querySelector(".cmp-accordion__header");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const summaryFrag = document.createDocumentFragment();
      if (title) {
        summaryFrag.appendChild(document.createComment(" field:summary "));
        summaryFrag.appendChild(document.createTextNode(title));
      }
      const panel = item.querySelector(".cmp-accordion__panel");
      const bodyNodes = [];
      if (panel) {
        const texts = Array.from(panel.querySelectorAll(".cmp-text"));
        const sources = texts.length ? texts : [panel];
        sources.forEach((src) => {
          Array.from(src.querySelectorAll(":scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > p, :scope > ul, :scope > ol, :scope > table")).filter((n) => n.textContent.trim()).forEach((n) => bodyNodes.push(n));
        });
        panel.querySelectorAll("img").forEach((img) => {
          if (!bodyNodes.some((n) => n.contains(img))) bodyNodes.push(img);
        });
      }
      const textFrag = document.createDocumentFragment();
      if (bodyNodes.length) {
        textFrag.appendChild(document.createComment(" field:text "));
        bodyNodes.forEach((n) => textFrag.appendChild(n));
      }
      cells.push([summaryFrag, textFrag]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-bordered", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-insights.js
  function parse5(element, { document }) {
    let items = Array.from(element.querySelectorAll(":scope > .cmp-cards--cardItems"));
    if (!items.length) items = Array.from(element.querySelectorAll(".insight-item"));
    const cells = [];
    const textOf2 = (el) => el ? el.textContent.replace(/\s+/g, " ").trim() : "";
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
      const date = textOf2(item.querySelector(".insight-item__content__public-date"));
      if (date) textNodes.push(para(date));
      const readTime = textOf2(item.querySelector(".insight-item__content__reading_time"));
      if (readTime) textNodes.push(para(readTime));
      const title = item.querySelector(".insight-item__content-text-and-tags h1, .insight-item__content-text-and-tags h2, .insight-item__content-text-and-tags h3, .insight-item__content-text-and-tags h4, .insight-item__content-text-and-tags h5, .insight-item__content-text-and-tags h6");
      if (title && textOf2(title)) {
        const h = document.createElement("h3");
        if (href) {
          const a = document.createElement("a");
          a.setAttribute("href", href);
          a.textContent = textOf2(title);
          h.appendChild(a);
        } else {
          h.textContent = textOf2(title);
        }
        textNodes.push(h);
      }
      const author = textOf2(item.querySelector(".insight-item__content__languange-and-author"));
      if (author) textNodes.push(para(author));
      item.querySelectorAll(".insight-item__content-text li").forEach((li) => {
        const tagLink = li.querySelector("a[href]");
        const label = textOf2(li);
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
      WebImporter.DOMUtils.remove(element, ["nav.cmp-breadcrumb", ".cmp-breadcrumb"]);
      WebImporter.DOMUtils.remove(element, [".cmp-link__screen-reader-only"]);
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

  // tools/importer/import-individual-2.js
  var PAGE_TEMPLATE = {
    "name": "individual-2",
    "urls": [
      "https://www.jupiteram.com/uk/en/individual/uk-equities/"
    ],
    "representativeUrl": "https://www.jupiteram.com/uk/en/individual/uk-equities/",
    "description": "Fund range landing page: offset-photo hero, overview text, circular fund cards, info cards, fund risk accordion, insights cards, important information band",
    "blocks": [
      {
        "name": "hero-offset-photo",
        "instances": [
          ".hero.teaser.cmp-hero--kaleBright .cmp-hero",
          ".hero.teaser .cmp-hero"
        ]
      },
      {
        "name": "cards-circular",
        "instances": [
          ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton .cmp-cards"
        ]
      },
      {
        "name": "cards-info",
        "instances": [
          ".cards.list.cmp-cards--borderlessBlue .cmp-cards",
          ".cmp-cards.defaultList"
        ]
      },
      {
        "name": "accordion-bordered",
        "instances": [
          ".accordion.panelcontainer .cmp-accordion",
          ".cmp-accordion"
        ]
      },
      {
        "name": "cards-insights",
        "instances": [
          ".cmp-cards.insightsList"
        ]
      }
    ],
    "urlPattern": "/uk/en/individual/*",
    "sections": [
      {
        "id": "s1",
        "name": "Hero",
        "selector": [
          ".hero.teaser.cmp-hero--kaleBright",
          ".hero.teaser"
        ],
        "style": null,
        "blocks": [
          "hero-offset-photo"
        ],
        "defaultContent": []
      },
      {
        "id": "s2",
        "name": "Overview",
        "selector": [
          ".text:has(> #overview)",
          "#overview"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "#overview"
        ]
      },
      {
        "id": "s3",
        "name": "A selection of our UK funds",
        "selector": [
          ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton"
        ],
        "style": null,
        "blocks": [
          "cards-circular"
        ],
        "defaultContent": [
          ".cards.list.cmp-cards--borderedWhite.cmp-cards--primaryButton .cmp-cards-container > .cmp-text"
        ]
      },
      {
        "id": "s4",
        "name": "Additional funds in our range",
        "selector": [
          ".cards.list.cmp-cards--borderlessBlue"
        ],
        "style": null,
        "blocks": [
          "cards-info"
        ],
        "defaultContent": [
          ".cards.list.cmp-cards--borderlessBlue .cmp-cards-container > .cmp-text"
        ]
      },
      {
        "id": "s5",
        "name": "Advice note and fund specific risks",
        "selector": [
          ".text:has(> #text-c19185da67)",
          "#text-c19185da67"
        ],
        "style": null,
        "blocks": [
          "accordion-bordered"
        ],
        "defaultContent": [
          "#text-c19185da67",
          ".accordion.panelcontainer .cmp-accordion > .cmp-text"
        ]
      },
      {
        "id": "s6",
        "name": "Latest insights from the team",
        "selector": [
          ".cards.list:has(#latestinsights)",
          "#latestinsights"
        ],
        "style": null,
        "blocks": [
          "cards-insights"
        ],
        "defaultContent": [
          "#latestinsights > .cmp-text"
        ]
      },
      {
        "id": "s7",
        "name": "Important information",
        "selector": [
          ".text.kale-bright-5"
        ],
        "style": "pale-blue, small-print",
        "blocks": [],
        "defaultContent": [
          ".text.kale-bright-5 .cmp-text"
        ]
      }
    ]
  };
  var parsers = {
    "hero-offset-photo": parse,
    "cards-circular": parse2,
    "cards-info": parse3,
    "accordion-bordered": parse4,
    "cards-insights": parse5
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
  var import_individual_2_default = {
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
  return __toCommonJS(import_individual_2_exports);
})();
