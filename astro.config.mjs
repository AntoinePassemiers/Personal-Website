import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

// For project pages, set these in your repository if needed:
// site: 'https://YOUR_USERNAME.github.io',
// base: '/YOUR_REPOSITORY_NAME',
export default defineConfig({
  integrations: [mdx()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});
