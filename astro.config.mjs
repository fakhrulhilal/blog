import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import { satteri } from '@astrojs/markdown-satteri';
import { headingAnchors } from './src/plugins/heading-anchors';
import { codeBlockFrame } from './src/plugins/code-block';

// Update `site` if you change the domain.
export default defineConfig({
  site: 'https://iroel.xyz',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    processor: satteri({ hastPlugins: [headingAnchors] }),
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
      transformers: [codeBlockFrame],
    },
  },
});
