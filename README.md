# blog

Source for `iroel.xyz`. Standalone repo — `main` holds the Astro
project (build tooling + posts), `gh-pages` holds the built static site.
Built with Astro + Bun. Comments are hosted by **Disqus**.

## Local preview

```sh
bun install
bun --bun run dev
```

Then open http://localhost:4321. Edits under `src/` hot-reload.

## Writing a post

Add a `.md` file under `src/content/posts/`, e.g. `src/content/posts/my-post.md`:

```md
---
title: My post
description: One line for the index page and RSS.
date: 2026-10-01
tags: [misc]
---

Body goes here.
```

Push to `main` and `.github/workflows/deploy.yml` builds and pushes `dist/`
to this repo's own `gh-pages` branch.

## One-time setup

1. **Pages** — Settings → Pages → Source: **Deploy from a branch**, branch
   **gh-pages**, folder `/`.
   - Custom domain: `iroel.xyz`, then enable **Enforce HTTPS** once the
     certificate issues.
   - DNS: apex domain, so add `A` records for `@` → `185.199.108.153`,
     `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (or an `ALIAS`/`ANAME`
     to `fakhrulhilal.github.io` if your DNS host supports it).
2. **Actions permissions** — Settings → Actions → General → Workflow
   permissions → **Read and write permissions**. Required so the default
   `GITHUB_TOKEN` can push to `gh-pages`.
3. **Disqus** — https://disqus.com
   - Create an account, then **Add Disqus to your site** (Universal Code,
     free "Basic" plan is fine) and register the site. Pick a **shortname**.
   - In the site's Settings → General, set the website URL to
     `https://iroel.xyz`; in Advanced, add that domain to **Trusted
     Domains** so the embed loads on it.
   - Put the shortname in `src/site.config.ts` under `disqus.shortname` —
     comments stay hidden on the site until this is filled in. No backend,
     database, or secrets are involved; the embed loads from
     `https://<shortname>.disqus.com/embed.js`.
4. **Analytics (PostHog)** — https://posthog.com
   - Create a project, copy the project API key.
   - Put it in `src/site.config.ts` under `posthog.key` (switch `apiHost` to
     the EU endpoint if your project is EU-hosted). Leave it empty to disable
     analytics entirely — the snippet just won't render.
5. **Telegram previews** — no setup needed; Telegram reads the `og:*` tags
   already in `BaseLayout.astro`. Test a post link in a Telegram chat once
   it's live.

## Notes

- `gh-pages` is generated output only — don't hand-edit it, it gets
  overwritten on every deploy.
- Dark/light mode follows the OS/browser setting automatically
  (Tailwind 4's default `prefers-color-scheme` variant) — no toggle to wire up.
- Comments are keyed by each post's URL path (`disqus_config.page.identifier`),
  so renaming a post's slug detaches its existing thread. The embed reloads
  itself when the theme is switched so Disqus follows light/dark.
- Disqus's free plan shows ads and third-party tracking in the embed; upgrade
  in the Disqus dashboard if that matters.
