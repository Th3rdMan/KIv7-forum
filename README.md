## 🧠 Kraland – Forum cartouche (compact)

[![Version](https://img.shields.io/badge/Version-2026.01.18.2-blueviolet?style=flat-square)](https://github.com/Th3rdMan/KIv7-forum/KIv7-forum)
[![Licence](https://img.shields.io/badge/Licence-MIT-green?style=flat-square)](./LICENSE)
[![Installer avec Tampermonkey](https://img.shields.io/badge/Tampermonkey-Installer-orange?style=flat-square&logo=greasemonkey)](https://greasyfork.org/fr/scripts/563123-kraland-forum-cartouche-compact)

**Forum cartouche (compact)** est un userscript pour **Tampermonkey** (compatible Violentmonkey), conçu pour compacter et stabiliser l’affichage des cartouches utilisateurs sur le **forum Kraland**.

> 🎯 Objectif : une cartouche plus lisible, plus compacte, sans “reflow” ni éléments parasites.  
> 🛠️ Technologies : JavaScript (DOM), CSS injecté, MutationObserver + throttling (rAF).

---

## ✨ Fonctionnalités principales

- 🧍 **Cartouche compactée et centrée**
  - Structure en colonne (avatar → nom → drapeau → labels → badge)
  - Espacements maîtrisés, rendu stable
- 🖼️ **Avatar repositionné**
  - Récupération de l’avatar depuis `.user-info`
  - Placement dans un conteneur dédié (`.tm-avatar`)
- 🏳️ **Drapeau conservé et isolé**
  - Détection par URL (`/world/logo`)
  - Placement dans `.tm-flag` + léger drop-shadow
- 🏷️ **Labels regroupés**
  - Wrap automatique dans `.tm-labels`
  - Capitalisation propre du texte des labels
- 🪪 **Badge rôle (icône + texte)**
  - Extraction du grade via tooltip (title / data-original-title)
  - Affichage dans un badge pill (`.tm-badge`) avec l’icône correspondante
  - Suppression de l’icône source pour éviter le doublon
- ⚡ **Stabilité & perf**
  - `MutationObserver` pour suivre les updates du forum
  - Throttling via `requestAnimationFrame` (1 passe max / frame)
  - Signature (`dataset.tmSig`) pour éviter les re-traitements inutiles
  - Déconnexion/reconnexion contrôlée de l’observer pendant le traitement (anti-boucle)

---

## 🚀 Installation

### Option A — Installation “one-click” (GitHub raw)
1. Installe un gestionnaire de userscripts :
   - [Tampermonkey](https://www.tampermonkey.net/)
   - [Violentmonkey](https://violentmonkey.github.io/)
2. Clique sur :
   - 👉 **[Installer le script](https://github.com/Th3rdMan/<REPO>/raw/main/<FICHIER>.user.js)**

### Option B — Installation manuelle
1. Crée un nouveau script dans Tampermonkey
2. Copie/colle le contenu du fichier `.user.js`
3. Sauvegarde

---

## 🧩 Compatibilité

- ✅ Forum Kraland (`*://www.kraland.org/forum/*`)
- ✅ Chrome / Firefox (Tampermonkey)
- ✅ Firefox (Violentmonkey)

---

## 📜 Licence

Sous licence **MIT** (voir `LICENSE`).
