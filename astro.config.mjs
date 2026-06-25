import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

export default defineConfig({
  site: 'https://AntoinePassemiers.github.io/Personal-Website',
  //site: 'https://AntoinePassemiers.github.io',
  //base: '/Personal-Website',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeSlug, rehypeKatex],
    remarkRehype: {
      footnoteLabel: 'References'
    },
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
});
