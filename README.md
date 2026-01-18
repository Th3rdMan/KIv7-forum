## 🧠 Kraland – Forum cartouche (compact)

[![Version](https://img.shields.io/badge/Version-2026.01.18.2-blueviolet?style=flat-square)](https://github.com/Th3rdMan/KIv7-forum)
[![Licence](https://img.shields.io/badge/Licence-MIT-green?style=flat-square)](./LICENSE)
[![Installer avec Tampermonkey](https://img.shields.io/badge/Tampermonkey-Installer-orange?style=flat-square&logo=greasemonkey)](https://greasyfork.org/fr/scripts/563123-kraland-forum-cartouche-compact)

**Forum cartouche (compact)** est un userscript pour **Tampermonkey** (compatible **Violentmonkey**) visant à **compacter et compléter** l’affichage des cartouches utilisateurs sur les **forum de Kraland**.

> 🎯 Objectif :
- Regrouper les informations utilisateur dans une **cartouche verticale cohérente**
- Réduire la hauteur et le bruit visuel
- Mettre en avant l’identité (avatar + nom), puis le contexte (drapeau, labels)
- Afficher **la fonction complète sous forme de badge**, combinant **icône + intitulé**, au lieu d’une simple icône isolée

👉 Résultat : une cartouche **plus lisible**, **plus compacte**, et **compréhensible immédiatement**, même sur des fils de discussion denses.

---

## ✨ Fonctionnalités

- 🧍 **Cartouche compacte et centrée**
  - Organisation verticale : avatar → nom → drapeau → labels → badge
  - Espacements constants, rendu stable
- 🖼️ **Avatar normalisé**
  - Extraction depuis `.user-info`
  - Repositionnement dans un conteneur dédié (`.tm-avatar`)
- 🏳️ **Drapeau isolé**
  - Détection fiable via l’URL (`/world/logo`)
  - Placement dédié (`.tm-flag`) avec ombrage léger
- 🏷️ **Labels regroupés**
  - Centralisation dans `.tm-labels`
  - Capitalisation automatique du texte
- 🪪 **Badge de rôle (icône + texte)**
  - Extraction du grade via tooltip (`title` / `data-original-title`)
  - Affichage dans un badge compact (`.tm-badge`)
  - Suppression de l’icône source pour éviter tout doublon
- ⚡ **Stabilité & performances**
  - Observation fine des mutations DOM
  - Limitation à une passe par frame (`requestAnimationFrame`)
  - Signature interne (`dataset.tmSig`) pour éviter les re-traitements inutiles
  - Déconnexion temporaire de l’observer pendant le rendu (anti-boucle)

---

## 🚀 Installation

| Avant | Après |
|:-----:|:-----:|
| ![](https://i.ibb.co/zWgKBW4W/image.png) | ![](https://i.ibb.co/bjN99rxq/image.png) |

### Installation recommandée (GreasyFork)
1. Installe un gestionnaire de userscripts :
   - [Tampermonkey](https://www.tampermonkey.net/)
   - [Violentmonkey](https://violentmonkey.github.io/)
2. Clique sur :
   - 👉 **https://greasyfork.org/fr/scripts/563123-kraland-forum-cartouche-compact**

---

## 🧩 Compatibilité

- ✅ Forum Kraland (`*://www.kraland.org/forum/*`)
- ✅ Chrome / Firefox (Tampermonkey)
- ✅ Firefox (Violentmonkey)

---

## 📜 Licence

Ce projet est distribué sous licence **MIT** (voir le fichier `LICENSE`).
