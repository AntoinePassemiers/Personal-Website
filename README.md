# Astro Pages

## Local development

```bash
npm install
npm run dev
```

Go to `http://localhost:4321`.

## Build

```bash
npm run build
npm run preview
```

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
