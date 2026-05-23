# Fancy Astro GitHub Pages Blog

A modern Astro skeleton for GitHub Pages with:

- reusable navbar/footer/layouts, avoiding duplicated HTML
- a language toggle button instead of separate `FR` / `EN` navbar links
- a persisted preferred language using `localStorage` plus a cookie
- paired English/French versions for pages and blog articles
- Markdown/MDX blog posts with syntax-highlighted code examples
- article tags, shown on the blog index pages
- a tiny client-side canvas game
- GitHub Actions workflow for Pages deployment

## Language model

GitHub Pages is static, so it cannot read a cookie on the server and choose HTML before the page is served.

This project therefore uses a client-side approach:

1. The language toggle stores the chosen language as `preferredLanguage` in `localStorage` and in a cookie.
2. Neutral routes such as `/`, `/blog/`, and `/game/` load a tiny redirect script.
3. The redirect script chooses the stored language, or falls back to the browser language.
4. The user is sent to `/en/`, `/fr/`, `/blog/en/`, `/blog/fr/`, `/game/en/`, or `/game/fr/`.

The cookie is useful for future integrations, but on pure GitHub Pages the actual routing decision happens in the browser.

## Paired page/article organization

Blog articles keep both language versions in the same folder:

```text
src/pages/blog/code-examples/
  en.md
  fr.md
```

The same idea is used for the game page:

```text
src/pages/game/
  en.astro
  fr.astro
```

The homepage uses locale-prefixed GitHub Pages routes:

```text
src/pages/en/index.astro
src/pages/fr/index.astro
```

You can extend this pattern for additional pages, for example:

```text
src/pages/about/
  index.astro    # optional redirect to preferred language
  en.astro
  fr.astro
```

## Local development

```bash
npm install
npm run dev
```

Open the local URL Astro prints, usually `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

## Deploy to GitHub Pages

1. Push this project to a GitHub repository.
2. In GitHub, go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. The included workflow at `.github/workflows/deploy.yml` builds and deploys the site.

For a project repository such as `https://github.com/YOUR_USERNAME/my-blog`, update `astro.config.mjs`:

```js
export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  base: '/my-blog',
  integrations: [mdx()]
});
```

For a user/organization repository named `YOUR_USERNAME.github.io`, you usually do not need `base`.

## Structure

```text
src/
  components/      Shared UI components such as Navbar and Footer
  layouts/         Shared page shells
  pages/           File-based routes and Markdown posts
public/
  game/            Client-side game JavaScript
  js/              Language persistence and redirect scripts
.github/workflows/ GitHub Pages deployment workflow
```
