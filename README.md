# blog

Source for `blog.iroel.xyz`. Standalone repo — `main` holds the Astro
project (build tooling + posts), `gh-pages` holds the built static site.
Built with Astro + Bun. Comments run on a self-hosted **Artalk** backend
(Postgres via Neon), with Google/GitHub/Microsoft/Facebook/X login.

## Local preview

Docker Compose (preferred) — one `compose.yaml` for local dev and
production, `blog` only starts with `--profile local`:

```sh
cp artalk.example.yml artalk-data/artalk.yml   # first time only
cp .env.example .env                           # first time only, fill in ATK_DB_*
docker compose --profile local up blog         # just the blog, no Neon needed
# or the full stack (blog + Artalk + Caddy behind comment.localhost/blog.localhost):
docker compose --profile local up -d
```

Blog-only: http://localhost:4321. Full stack: https://blog.localhost and
https://comment.localhost (self-signed by Caddy — expect a browser warning,
or set up `deploy/ca/generate-cert.sh` for a trusted cert). Edits to files
under `src/` hot-reload either way.

Direct (no Docker, blog only — Artalk still needs its own container or
binary):

```sh
bun install
bun --bun run dev
```

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
   - Custom domain: `blog.iroel.xyz`, then enable **Enforce HTTPS** once the
     certificate issues.
   - DNS: `CNAME` record for `blog` → `fakhrulhilal.github.io`.
2. **Actions permissions** — Settings → Actions → General → Workflow
   permissions → **Read and write permissions**. Required so the default
   `GITHUB_TOKEN` can push to `gh-pages`.
3. **Neon** — create a Postgres database (a dedicated branch for this, not
   shared with something else). Grab the **pooled** connection details
   (host ends in `-pooler`), not the direct one — Artalk holds a persistent
   pool.
4. **Artalk backend** — `compose.yaml` at the repo root runs Artalk behind
   Caddy (automatic HTTPS) for both local testing and production; it's the
   same file, `docker compose up -d` on the VM. Caddy issues and renews the
   Let's Encrypt cert automatically (~7 days before expiry, see
   `deploy/Caddyfile`), no cron or init script needed.
   - On the VM: copy `.env.example` → `.env`, set `DOMAIN=discuss.iroel.xyz`
     and the Neon/OAuth values, point DNS at the VM, open ports 80/443, then
     `docker compose up -d`.
   - Copy `artalk.example.yml` → `artalk-data/artalk.yml`, point `db.*` at
     Neon (`ssl: true`), set `site_default` and `trusted_domains` to
     `blog.iroel.xyz`.
   - For each login provider you want (Google, GitHub, Microsoft, Facebook,
     X/Twitter), register an OAuth app with that provider and fill in
     `auth.<provider>.client_id` / `client_secret` — or pass them as
     `ATK_AUTH_<PROVIDER>_CLIENT_ID` / `_CLIENT_SECRET` env vars instead of
     writing secrets into the file.
   - Once it's live, set `artalk.server` in `src/site.config.ts` to that
     URL (e.g. `https://artalk.iroel.xyz`) — comments stay hidden on the
     site until this is filled in.
5. **Analytics (PostHog)** — https://posthog.com
   - Create a project, copy the project API key.
   - Put it in `src/site.config.ts` under `posthog.key` (switch `apiHost` to
     the EU endpoint if your project is EU-hosted). Leave it empty to disable
     analytics entirely — the snippet just won't render.
6. **Telegram previews** — no setup needed; Telegram reads the `og:*` tags
   already in `BaseLayout.astro`. Test a post link in a Telegram chat once
   it's live.

## Notes

- `gh-pages` is generated output only — don't hand-edit it, it gets
  overwritten on every deploy.
- Dark/light mode follows the OS/browser setting automatically
  (Tailwind 4's default `prefers-color-scheme` variant) — no toggle to wire up.
- Comments live in Artalk's own Postgres tables (Neon), not GitHub
  Discussions — that's the deliberate trade for multi-provider login.
- Check `artalk.example.yml`'s config/env-var key names against whatever
  Artalk version you actually deploy before trusting them blindly — they've
  shifted across releases (docs: https://artalk.js.org/en/guide/backend/config.html,
  https://artalk.js.org/en/guide/env.html).
