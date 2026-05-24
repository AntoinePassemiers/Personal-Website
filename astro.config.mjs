import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    remarkRehype: {
      footnoteLabel: 'References'
    },
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
});

// For project pages, set these in your repository if needed:
// site: 'https://YOUR_USERNAME.github.io',
// base: '/YOUR_REPOSITORY_NAME',
