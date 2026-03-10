// ==UserScript==
// @name         Kraland – Forum cartouche (compact)
// @namespace    https://kraland.org/
// @version      2026.01.18.3
// @description  Forum Kraland : cartouche utilisateur compact, stable, sans reflow (avatar, nom, drapeau, labels, badge)
// @author       Th3rD
// @match        *://www.kraland.org/forum/*
// @icon         http://img7.kraland.org/2/mat/25/2514.gif
// @run-at       document-idle
// @license      MIT
// @noframes
// @grant        none
// ==/UserScript==

(() => {
  'use strict';

  // ─── Constants ───────────────────────────────────────────────────────────────

  const STYLE_ID = 'tm-cartouche-style-compact';
  const OBS_OPTS = { childList: true, subtree: true };

  const CSS = `
    .cartouche { display:flex!important; flex-direction:column!important; align-items:center!important; gap:6px!important }
    .tm-avatar, .tm-flag { display:flex; justify-content:center }
    .tm-name { display:flex; justify-content:center; text-align:center; line-height:1.15 }
    .tm-name strong a { font-size:13px; font-weight:600; letter-spacing:.15px; text-shadow:0 1px 2px rgba(0,0,0,.35);
      max-width:160px; display:inline-block; white-space:normal; overflow-wrap:anywhere; opacity:.95 }
    .tm-name strong img { display:inline-block; vertical-align:middle; margin:0 3px; opacity:.9 }
    .tm-flag img[src*="/world/logo"] { filter:drop-shadow(0 1px 1px rgba(0,0,0,.25)); opacity:.95 }
    .tm-labels { display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-top:-2px }
    .tm-labels .label { margin:0!important }
    .tm-badge { display:inline-flex; align-items:center; gap:8px; font-size:9.5px; line-height:1.2;
      color:rgba(255,255,255,.92); text-align:left; max-width:210px; padding:4px 12px; border-radius:999px;
      background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.08);
      box-shadow:0 1px 2px rgba(0,0,0,.25); overflow-wrap:anywhere; hyphens:auto }
    .tm-badge img { width:18px; height:18px; object-fit:contain; filter:drop-shadow(0 1px 1px rgba(0,0,0,.35)); flex:0 0 auto }
    .tm-badge span { display:inline-block; max-width:170px; overflow-wrap:anywhere; hyphens:auto }
  `;

  // ─── DOM helpers ─────────────────────────────────────────────────────────────

  const qs    = (root, sel) => root.querySelector(sel);
  const qsa   = (root, sel) => Array.from(root.querySelectorAll(sel));
  const rm    = (node) => node?.remove?.() ?? node?.parentNode?.removeChild?.(node);
  const cap1  = (str)  => { str = (str || '').trim(); return str ? str[0].toUpperCase() + str.slice(1) : ''; };

  const imgSrc = (img) => img?.getAttribute('src') || img?.src || '';
  const imgTip = (img) => (img?.getAttribute('data-original-title') || img?.getAttribute('title') || '').trim();
  const imgDim = (img) => ({
    w: parseInt(img?.getAttribute?.('width')  || '', 10) || img?.naturalWidth  || img?.width  || 0,
    h: parseInt(img?.getAttribute?.('height') || '', 10) || img?.naturalHeight || img?.height || 0,
  });

  const isFlag = (img) => imgSrc(img).includes('/world/logo');
  const isSmallIcon = (img) => { const { w, h } = imgDim(img); return w && h && w <= 32 && h <= 32; };

  /** Ensures a direct child <div class=cls> exists, creates it if missing. */
  const ensureSlot = (root, cls) =>
    qs(root, `:scope > .${cls}`) ||
    root.appendChild(Object.assign(document.createElement('div'), { className: cls }));

  /**
   * Moves a node into a wrapper. If the node is wrapped in an inline parent
   * (A/SPAN) that is a direct child of root, moves the wrapper instead.
   */
  const moveInto = (root, wrap, node) => {
    wrap.textContent = '';
    if (!node) return;
    const parent = node.parentElement;
    const canHoistParent = parent && parent.parentElement === root && /^(A|SPAN)$/.test(parent.tagName);
    wrap.appendChild(canHoistParent ? parent : node);
  };

  /**
   * Removes a node. If it sits in an inline wrapper (A/SPAN) that is a
   * direct child of root, removes the wrapper instead.
   */
  const removeFrom = (root, node) => {
    if (!node) return;
    const parent = node.parentElement;
    const canRemoveParent = parent && parent.parentElement === root && /^(A|SPAN)$/.test(parent.tagName);
    rm(canRemoveParent ? parent : node);
  };

  // ─── CSS injection (idempotent) ───────────────────────────────────────────────

  if (!document.getElementById(STYLE_ID)) {
    document.head.appendChild(
      Object.assign(document.createElement('style'), { id: STYLE_ID, textContent: CSS })
    );
  }

  // ─── Per-cartouche logic ──────────────────────────────────────────────────────

  /**
   * Returns the avatar <img> from the sibling .user-info element, if any.
   * The avatar lives outside .cartouche and must be adopted into it.
   */
  const findAvatar = (cartouche) => {
    const userInfo = cartouche.closest('.user-info');
    if (!userInfo) return null;
    return (
      qs(userInfo, ':scope > img.avatar') ||
      qs(userInfo, ':scope > img.img-thumbnail') ||
      qs(userInfo, 'img.avatar') ||
      qs(userInfo, 'img.img-thumbnail')
    );
  };

  /**
   * Picks the best "role icon" candidate: a small, titled image that is
   * neither a flag nor inside <strong>. Smallest area wins.
   */
  const findRoleIcon = (cartouche) =>
    qsa(cartouche, 'img')
      .filter(img => !isFlag(img) && !img.closest('strong') && imgTip(img) && isSmallIcon(img))
      .sort((a, b) => (imgDim(a).w * imgDim(a).h) - (imgDim(b).w * imgDim(b).h))[0] ?? null;

  /**
   * Wraps all loose .label spans into a single .tm-labels div.
   * Capitalises label text in passing.
   */
  const collectLabels = (cartouche) => {
    const labels = qsa(cartouche, ':scope > span.label');
    const wrap   = qs(cartouche, ':scope > .tm-labels');
    if (!labels.length) return wrap ?? null;

    const container = wrap ?? cartouche.appendChild(
      Object.assign(document.createElement('div'), { className: 'tm-labels' })
    );
    container.textContent = '';
    labels.forEach(l => { l.textContent = cap1(l.textContent); container.appendChild(l); });
    return container;
  };

  /**
   * Creates / updates the role badge pill (icon + grade text).
   * Removes it when there is no text.
   */
  const renderBadge = (cartouche, text, iconSrc) => {
    text = (text || '').trim();
    let badge = qs(cartouche, ':scope > .tm-badge');

    if (!text) { rm(badge); return null; }

    badge ??= cartouche.appendChild(
      Object.assign(document.createElement('div'), { className: 'tm-badge' })
    );

    // Skip full rebuild when nothing changed
    if (badge.dataset.t === text && badge.dataset.s === (iconSrc || '')) return badge;

    badge.dataset.t = text;
    badge.dataset.s = iconSrc || '';
    badge.textContent = '';

    if (iconSrc) {
      badge.appendChild(Object.assign(document.createElement('img'), { src: iconSrc, alt: '' }));
    }
    badge.appendChild(Object.assign(document.createElement('span'), { textContent: text }));

    return badge;
  };

  /**
   * Removes any leftover small icons that are no longer needed
   * (the role icon has already been extracted and rendered in the badge).
   */
  const pruneOrphanIcons = (cartouche, keep) => {
    qsa(cartouche, 'img').forEach(img => {
      if (keep.has(img) || img.closest('strong') || isFlag(img)) return;
      if (isSmallIcon(img)) removeFrom(cartouche, img);
    });
  };

  /**
   * Computes a cheap stable signature for the cartouche's rendered state.
   * Used to bail out early when nothing has changed.
   */
  const cartoucheSignature = (cartouche, grade, roleSrc) => [
    !!qs(cartouche, ':scope > .tm-avatar img'),
    (qs(cartouche, ':scope > .tm-name')?.textContent || '').trim(),
    !!qs(cartouche, ':scope > .tm-flag img'),
    (qs(cartouche, ':scope > .tm-labels')?.textContent || '').trim(),
    (grade    || '').trim(),
    (roleSrc  || '').trim(),
  ].join('|');

  /**
   * Main enhancement pass for a single .cartouche element.
   * Idempotent: skips work when the signature hasn't changed.
   */
  const enhance = (cartouche) => {
    // Only process cartouches that hold a linked username
    if (!qs(cartouche, 'strong a')) return;

    // ── Early bail if rendered state is already up to date ──────────────────
    const currentSig = [
      !!qs(cartouche, ':scope > .tm-avatar img'),
      (qs(cartouche, ':scope > .tm-name')?.textContent || qs(cartouche, 'strong')?.textContent || '').trim(),
      !!qs(cartouche, ':scope > .tm-flag img'),
      (qs(cartouche, ':scope > .tm-labels')?.textContent || '').trim(),
      (cartouche.dataset.tmGrade   || '').trim(),
      (cartouche.dataset.tmRoleSrc || '').trim(),
    ].join('|');
    if (cartouche.dataset.tmSig === currentSig) return;

    // ── Slots ────────────────────────────────────────────────────────────────
    const avatarSlot = ensureSlot(cartouche, 'tm-avatar');
    const nameSlot   = ensureSlot(cartouche, 'tm-name');
    const flagSlot   = ensureSlot(cartouche, 'tm-flag');

    // ── Name ────────────────────────────────────────────────────────────────
    const strong = qs(cartouche, 'strong');
    if (!nameSlot.contains(strong)) nameSlot.appendChild(strong);

    // ── Avatar (adopted from sibling .user-info) ─────────────────────────────
    const avatar = findAvatar(cartouche);
    if (avatar && !avatar.closest('.tm-avatar')) {
      avatarSlot.textContent = '';
      avatarSlot.appendChild(avatar);
    }

    // ── Flag ─────────────────────────────────────────────────────────────────
    const flagImg = qsa(cartouche, 'img').find(isFlag) ?? null;
    moveInto(cartouche, flagSlot, flagImg);

    // ── Role icon → badge (extract data then remove original) ─────────────────
    const roleIcon = findRoleIcon(cartouche);
    const grade    = (roleIcon ? imgTip(roleIcon) : cartouche.dataset.tmGrade   || '').trim();
    const roleSrc  = (roleIcon ? imgSrc(roleIcon) : cartouche.dataset.tmRoleSrc || '').trim();

    if (grade)   cartouche.dataset.tmGrade   = grade;
    if (roleSrc) cartouche.dataset.tmRoleSrc = roleSrc;

    if (roleIcon) removeFrom(cartouche, roleIcon);

    // ── Labels & badge ────────────────────────────────────────────────────────
    const labelsSlot = collectLabels(cartouche);
    const badgeSlot  = renderBadge(cartouche, grade, roleSrc);

    // ── Cleanup leftover small icons ──────────────────────────────────────────
    pruneOrphanIcons(cartouche, new Set([flagImg].filter(Boolean)));

    // ── Final slot order ──────────────────────────────────────────────────────
    [avatarSlot, nameSlot, flagSlot, labelsSlot, badgeSlot]
      .filter(Boolean)
      .forEach(slot => cartouche.appendChild(slot));

    // ── Persist stable signature ──────────────────────────────────────────────
    cartouche.dataset.tmSig = cartoucheSignature(cartouche, grade, roleSrc);
  };

  // ─── Observer + scheduler ────────────────────────────────────────────────────

  const run = () => qsa(document, '.cartouche').forEach(enhance);

  let scheduled = false;
  let observer  = null;

  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      observer.disconnect();
      try { run(); } finally { observer.observe(document.body, OBS_OPTS); }
    });
  };

  observer = new MutationObserver(schedule);
  observer.observe(document.body, OBS_OPTS);
  run();

})();
