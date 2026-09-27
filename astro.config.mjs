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
    // Lets `bun run dev` be opened as e.g. http://local.iroel.xyz:4321 (hosts entry -> 127.0.0.1),
    // since Disqus refuses `localhost` as a trusted domain but accepts subdomains of iroel.xyz.
    server: { allowedHosts: ['.iroel.xyz', '.localtest.me'] },
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
