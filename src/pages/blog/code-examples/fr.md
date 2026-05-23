---
layout: ../../../layouts/PostLayout.astro
title: Exemples de code dans un blog statique
description: Un article technique minimal avec code inline, blocs colorés et sorties statiques façon notebook.
date: 2026-05-22
lang: fr
tag: Machine Learning
---

Cet article est écrit en Markdown, puis transformé par Astro en HTML statique que GitHub Pages peut héberger.

Le code inline comme `const reponse = 42` fonctionne naturellement, et les blocs de code sont colorés au moment du build.

```ts
export function saluer(nom: string): string {
  return `Bonjour, ${nom} !`;
}

console.log(saluer('GitHub Pages'));
```

Vous pouvez aussi inclure des sorties statiques façon notebook. Elles ne sont pas exécutées par GitHub Pages ; ce sont simplement des contenus rendus dans la page.

```python
valeurs = [2, 3, 5, 8, 13]
sum(valeurs) / len(valeurs)
```

```text
6.2
```

Pour publier de vrais notebooks, vous pouvez remplacer ou compléter ce squelette avec Quarto, MDX ou une étape de build qui convertit des notebooks en Markdown/HTML avant le build Astro.

## Pourquoi cela supprime la duplication

La navbar et la structure de page ne sont pas répétées dans cet article. Ce fichier ne contient que le contenu et le frontmatter. Astro l’injecte dans `PostLayout.astro`, qui utilise lui-même `BaseLayout.astro`, `Navbar.astro` et `Footer.astro`.
