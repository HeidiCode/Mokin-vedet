/* Hana design system — the documentation site's script.
   ---------------------------------------------------------------------------
   Every page is plain HTML with its own content. This script adds what all
   pages share, so it is written once:

   - the top bar, the sidebar and the previous / next links (from NAV below)
   - live examples: each .ds-example gets a "Show code" toggle whose code is
     read from the preview itself, so the sample can never drift from it
   - token data read from tokens.json and from the computed CSS, so swatches,
     scales and contrast ratios always show the values the app really uses

   No framework and no build step, like the app.
   ------------------------------------------------------------------------- */

(function () {
  "use strict";

  const REPO = "https://github.com/HeidiCode/Mokin-vedet";
  const SRC = REPO + "/blob/main/v2/";

  /* The sidebar, in reading order. The pager follows the same order. */
  const NAV = [
    { label: "Getting started", items: [
      ["index.html", "Introduction"],
    ]},
    { label: "Foundations", items: [
      ["colors.html", "Colour"],
      ["typography.html", "Typography"],
      ["spacing.html", "Spacing and shape"],
      ["accessibility.html", "Accessibility"],
    ]},
    { label: "Components", items: [
      ["app-bar.html", "App bar"],
      ["process-card.html", "Process card"],
      ["contact-box.html", "Contact box"],
      ["progress-bar.html", "Progress bar"],
      ["phase-heading.html", "Phase heading"],
      ["step-card.html", "Step card"],
      ["photo.html", "Photo and lightbox"],
      ["note.html", "Note (Huomio)"],
      ["button.html", "Primary button"],
      ["completion-modal.html", "Completion modal"],
    ]},
  ];

  const icons = window.DS_ICONS || {};
  const page = location.pathname.split("/").pop() || "index.html";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---------- Announcements and copying ---------- */

  const live = document.createElement("div");
  live.className = "sr-only";
  live.setAttribute("aria-live", "polite");
  document.body.appendChild(live);

  function copy(text, button) {
    const done = () => {
      live.textContent = "Copied to clipboard";
      if (button && button.dataset.label) {
        button.textContent = "Copied";
        setTimeout(() => { button.textContent = button.dataset.label; }, 1600);
      }
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
    } else {
      fallback(text, done);
    }
  }

  function fallback(text, done) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "absolute";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done(); } catch (e) { /* nothing to do */ }
    ta.remove();
  }

  /* ---------- Shell: top bar, sidebar, pager ---------- */

  function renderShell() {
    const top = $("#ds-top");
    if (top) {
      top.innerHTML = `
        <button class="ds-menu-btn" type="button" aria-controls="ds-side" aria-expanded="false" aria-label="Menu"><svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M2 4h16v2H2zM2 9h16v2H2zM2 14h16v2H2z" fill="currentColor"/></svg></button>
        <a class="ds-brand" href="index.html">
          <span class="ds-brand__name">Hana</span>
          <span class="ds-brand__sub">Mökin vedet v2 · Design system</span>
        </a>
        <div class="ds-top__links">
          <a class="ds-chip-link ds-keep" href="../">Open the app</a>
          <a class="ds-chip-link" href="${REPO}/tree/main/v2/design-system">GitHub</a>
          <span class="ds-chip-link" aria-disabled="true" title="The Figma file is coming soon">Figma · soon</span>
        </div>`;
    }

    const side = $("#ds-side");
    if (side) {
      side.innerHTML = `<nav class="ds-nav" aria-label="Design system">${NAV.map(group => `
        <div class="ds-nav__group">
          <p class="ds-nav__label">${group.label}</p>
          <ul>${group.items.map(([href, label]) =>
            `<li><a href="${href}"${href === page ? ' aria-current="page"' : ""}>${label}</a></li>`).join("")}
          </ul>
        </div>`).join("")}</nav>`;
    }

    const btn = $(".ds-menu-btn");
    if (btn && side) {
      const setMenu = open => {
        side.classList.toggle("is-open", open);
        btn.setAttribute("aria-expanded", String(open));
        document.documentElement.classList.toggle("ds-menu-open", open);
      };
      btn.addEventListener("click", () => {
        const open = !side.classList.contains("is-open");
        setMenu(open);
        if (open) { const a = $("a[aria-current]", side) || $("a", side); if (a) a.focus({ preventScroll: true }); }
      });
      document.addEventListener("keydown", e => {
        if (e.key === "Escape" && side.classList.contains("is-open")) { setMenu(false); btn.focus(); }
      });
      /* A tap outside the open menu only closes it; it must not also follow a
         link or press a button on the page behind. */
      document.addEventListener("click", e => {
        if (!side.classList.contains("is-open") || side.contains(e.target) || btn.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        setMenu(false);
        btn.focus({ preventScroll: true });
      }, true);
    }

    const doc = $(".ds-doc");
    if (!doc) return;
    const flat = NAV.flatMap(g => g.items);
    const i = flat.findIndex(([href]) => href === page);
    const prev = flat[i - 1];
    const next = flat[i + 1];
    if (prev || next) {
      const pager = document.createElement("nav");
      pager.className = "ds-pager";
      pager.setAttribute("aria-label", "Previous and next page");
      pager.innerHTML =
        (prev ? `<a class="ds-card ds-prev" href="${prev[0]}"><small>Previous</small><span class="ds-pager__name">${prev[1]}</span>${icons.arrowLeft || ""}</a>` : "") +
        (next ? `<a class="ds-card ds-next" href="${next[0]}"><small>Next</small><span class="ds-pager__name">${next[1]}</span>${icons.arrowLeft || ""}</a>` : "");
      doc.appendChild(pager);
    }
    const foot = document.createElement("footer");
    foot.className = "ds-foot";
    foot.innerHTML = `Hana is the design system of <a href="../">Mökin vedet v2</a>. Every value on this site is read live from <a href="${SRC}design-system/tokens.json">tokens.json</a> and the app's own CSS.`;
    doc.appendChild(foot);
  }

  /* ---------- Live examples ---------- */

  /* Icons are written <i data-icon="check"></i> in the page source. The preview
     swaps in the real SVG; the code sample shows ${icons.check}, the way the
     app's renderer writes it. */
  function snippetFrom(el) {
    const clone = el.cloneNode(true);
    $$("[data-icon]", clone).forEach(i => i.replaceWith(document.createTextNode("${icons." + i.dataset.icon + "}")));
    $$("[data-ds-only]", clone).forEach(n => n.remove());
    let html = clone.innerHTML.replace(/^\s*\n/, "").replace(/\s+$/, "");
    const lines = html.split("\n");
    const indent = Math.min(...lines.filter(l => l.trim()).map(l => l.match(/^ */)[0].length));
    return lines.map(l => l.slice(indent)).join("\n").replace(/=""/g, "");
  }

  function drawIcons(root) {
    $$("[data-icon]", root).forEach(i => {
      const svg = icons[i.dataset.icon];
      if (svg) i.outerHTML = svg;
    });
  }

  function renderExamples() {
    $$(".ds-example").forEach((ex, n) => {
      const inner = $(".ds-preview__inner", ex) || $(".ds-preview", ex);
      const code = snippetFrom(inner);
      const id = "ds-code-" + n;
      const head = document.createElement("div");
      head.className = "ds-example__head";
      head.innerHTML = `
        <p class="ds-example__title">${esc(ex.dataset.title || "Example")}</p>
        <div class="ds-example__actions">
          <button type="button" class="ds-copy" data-toggle aria-expanded="false" aria-controls="${id}">Show code</button>
        </div>`;
      ex.prepend(head);

      const block = document.createElement("div");
      block.className = "ds-code";
      block.id = id;
      block.hidden = true;
      block.innerHTML = `<button type="button" class="ds-copy" data-label="Copy">Copy</button><pre><code>${esc(code)}</code></pre>`;
      ex.appendChild(block);

      $("[data-toggle]", head).addEventListener("click", e => {
        block.hidden = !block.hidden;
        e.currentTarget.textContent = block.hidden ? "Show code" : "Hide code";
        e.currentTarget.setAttribute("aria-expanded", String(!block.hidden));
      });
      $(".ds-copy", block).addEventListener("click", e => copy(code, e.currentTarget));
    });
    drawIcons(document);

    /* Static code blocks written straight into a page. */
    $$("pre[data-copy]").forEach(pre => {
      const wrap = document.createElement("div");
      wrap.className = "ds-code";
      pre.replaceWith(wrap);
      wrap.appendChild(pre);
      const b = document.createElement("button");
      b.type = "button";
      b.className = "ds-copy";
      b.dataset.label = b.textContent = "Copy";
      b.addEventListener("click", () => copy(pre.textContent, b));
      wrap.prepend(b);
      wrap.style.borderRadius = "var(--radius)";
      wrap.style.border = "var(--border-width) solid var(--border)";
      wrap.style.overflow = "hidden";
    });

    /* Example controls must not act like the app: no navigation, no reload. */
    $$(".ds-preview button, .ds-preview a").forEach(b => b.addEventListener("click", e => e.preventDefault()));
  }

  /* ---------- Tokens ---------- */

  const rootStyle = getComputedStyle(document.documentElement);
  const cssVal = name => rootStyle.getPropertyValue("--" + name).trim();

  function flatten(group, path = [], type) {
    const out = [];
    const t = group.$type || type;
    for (const [key, node] of Object.entries(group)) {
      if (key.startsWith("$")) continue;
      if ("$value" in node) out.push({ name: key, group: path[0], type: node.$type || t, value: node.$value, description: node.$description || "" });
      else out.push(...flatten(node, path.concat(key), t));
    }
    return out;
  }

  /* Resolve any CSS colour to rgb(a) numbers by letting the browser parse it. */
  const probe = document.createElement("span");
  probe.style.display = "none";
  document.body.appendChild(probe);
  function rgb(color) {
    probe.style.color = "";
    probe.style.color = color;
    const m = getComputedStyle(probe).color.match(/[\d.]+/g).map(Number);
    return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 };
  }
  function hex(color) {
    const { r, g, b, a } = rgb(color);
    if (a < 1) return color;
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("");
  }
  function luminance({ r, g, b }) {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  }
  function contrast(fg, bg) {
    const a = luminance(rgb(fg));
    const b = luminance(rgb(bg));
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  function tokenChip(t) {
    const val = cssVal(t.name);
    const dot = t.type === "color" ? `<span class="ds-token__dot" style="background:var(--${t.name})"></span>` : "";
    return `<li><button type="button" class="ds-token" data-copy-var="${t.name}" title="${esc(t.description)}">${dot}--${t.name}<span class="ds-token__val">${esc(t.type === "color" ? hex(val) : val)}</span></button></li>`;
  }

  function renderTokens(tokens) {
    const byName = Object.fromEntries(tokens.map(t => [t.name, t]));

    $$("[data-tokens]").forEach(el => {
      el.innerHTML = el.dataset.tokens.split(/\s+/).filter(Boolean)
        .map(n => byName[n] ? tokenChip(byName[n]) : "").join("");
    });

    $$("[data-ds='colors']").forEach(el => {
      el.innerHTML = el.dataset.names.split(/\s+/).map(n => {
        const t = byName[n];
        if (!t) return "";
        const alias = typeof t.value === "string" && t.value.startsWith("{")
          ? `<span class="ds-swatch__alias">Follows --${t.value.slice(1, -1).split(".").pop()}</span>` : "";
        return `<button type="button" class="ds-swatch" data-copy-var="${n}">
          <span class="ds-swatch__color" style="background:var(--${n})"></span>
          <span class="ds-swatch__body">
            <span class="ds-swatch__name">--${n}</span>
            <span class="ds-swatch__value">${esc(hex(cssVal(n)))}</span>
            ${alias}
            <span class="ds-swatch__desc">${esc(t.description)}</span>
          </span>
        </button>`;
      }).join("");
    });

    $$("[data-ds='space']").forEach(el => {
      el.innerHTML = tokens.filter(t => t.group === "space").map(t => `
        <div class="ds-space-row">
          <code>--${t.name}</code>
          <span>${esc(cssVal(t.name))}</span>
          <span class="ds-space-bar" style="width:var(--${t.name})"></span>
          ${t.description ? `<span class="ds-space-note">${esc(t.description)}</span>` : ""}
        </div>`).join("");
    });

    $$("[data-ds='token-table']").forEach(el => {
      const groups = el.dataset.groups.split(/\s+/);
      el.innerHTML = `<table class="ds-table"><thead><tr><th>Token</th><th>Value</th><th>Use</th></tr></thead><tbody>${
        tokens.filter(t => groups.includes(t.group)).map(t => `<tr>
          <td><code>--${t.name}</code></td>
          <td><code>${esc(cssVal(t.name))}</code></td>
          <td>${esc(t.description)}</td></tr>`).join("")
      }</tbody></table>`;
    });

    document.addEventListener("click", e => {
      const b = e.target.closest("[data-copy-var]");
      if (b) copy(`var(--${b.dataset.copyVar})`);
    });
  }

  /* Every text pair the app draws, and the boundaries that must stay visible.
     Ratios are computed from the live tokens, so a retint shows up here. */
  const PAIRS = [
    ["text", "bg-page", "Body text on the page", 4.5],
    ["text", "bg-card", "Text on cards", 4.5],
    ["text", "bg-done", "Text on a done step", 4.5],
    ["text", "accent", "Text on the accent fill (buttons, badges)", 4.5],
    ["text", "bg-note", "Note text", 4.5],
    ["text-accent", "bg-card", "Uppercase labels on cards", 4.5],
    ["text-accent", "bg-done", "Uppercase labels on a done step", 4.5],
    ["text-accent", "bg-page", "Phase labels on the page", 4.5],
    ["bg-card", "text-accent", "Note tab (white on green)", 4.5],
    ["bg-card", "border", "AVAA bar on photos", 4.5],
    ["text-muted", "bg-locked", "Locked step title and number", 4.5],
    ["border-locked", "bg-locked", "Dashed border, the locked card's only outline", 3],
    ["icon-lock", "bg-locked", "Padlock icon", 3],
  ];

  function renderContrast() {
    $$("[data-ds='contrast']").forEach(el => {
      el.innerHTML = `<table class="ds-table"><thead><tr><th>Sample</th><th>Pair</th><th>Where</th><th>Ratio</th></tr></thead><tbody>${
        PAIRS.map(([fg, bg, use, min]) => {
          const r = contrast(cssVal(fg), cssVal(bg));
          const ok = r >= min;
          return `<tr>
            <td>${min < 4.5
              ? `<span class="ds-pair" style="background:var(--${bg})" aria-hidden="true"><span class="ds-pair__mark" style="border-color:var(--${fg});background:var(--${fg === "icon-lock" ? fg : bg})"></span></span>`
              : `<span class="ds-pair" style="color:var(--${fg});background:var(--${bg})">Aa</span>`}</td>
            <td><code>--${fg}</code><br>on <code>--${bg}</code></td>
            <td>${esc(use)}</td>
            <td><strong>${r.toFixed(1)}:1</strong><br><span class="${ok ? "ds-pass" : ""}">${ok ? "Passes" : "Fails"} ${min}:1</span></td>
          </tr>`;
        }).join("")
      }</tbody></table>`;
    });
  }

  /* Type specimens: each row reads its own sample's computed style. */
  function renderType() {
    $$(".ds-type-row").forEach(row => {
      const sample = $(".ds-type-sample > *", row);
      const out = $("[data-type-meta]", row);
      if (!sample || !out) return;
      const s = getComputedStyle(sample);
      const family = s.fontFamily.split(",")[0].replace(/"/g, "");
      out.textContent = `${family} · ${parseFloat(s.fontSize)}/${Math.round(parseFloat(s.lineHeight)) || "normal"} · ${s.fontWeight}`;
    });
  }

  /* Tables and code can scroll sideways on a phone; a keyboard user has to be
     able to reach them to scroll. */
  function makeScrollersFocusable() {
    const seen = {};
    $$(".ds-table-wrap, .ds-code pre").forEach(el => {
      const kind = el.matches("pre") ? "Code" : "Table";
      const ex = el.closest(".ds-example");
      const h2 = el.closest("section") && $("h2", el.closest("section"));
      let name = `${kind}: ${ex ? ex.dataset.title : h2 ? h2.textContent : ""}`;
      seen[name] = (seen[name] || 0) + 1;
      if (seen[name] > 1) name += " " + seen[name];
      el.tabIndex = 0;
      el.setAttribute("role", "region");
      el.setAttribute("aria-label", name);
    });
  }

  /* ---------- Go ---------- */

  /* A new page opens at its top. Browsers (and some embedding frames) can
     carry the previous scroll position over; only a #section link may move. */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (!location.hash) window.scrollTo(0, 0);

  renderShell();
  renderExamples();
  renderContrast();
  makeScrollersFocusable();

  const needsTokens = $("[data-tokens], [data-ds='colors'], [data-ds='space'], [data-ds='token-table']");
  if (needsTokens) {
    fetch("tokens.json")
      .then(r => r.json())
      .then(data => renderTokens(flatten(data)))
      .catch(() => $$("[data-tokens], [data-ds]").forEach(el => {
        if (!el.innerHTML.trim()) el.innerHTML = `<p>Could not load tokens.json. Open the site through a web server, not as a file.</p>`;
      }));
  }

  /* Fonts change the metrics, so measure type once they have loaded. */
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(renderType);
})();
