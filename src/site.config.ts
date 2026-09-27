// Central place for the knobs you'll actually want to change.
export const siteConfig = {
  title: 'Fakhrulhilal M',
  description: 'Notes on tooling, automation, and whatever else.',
  author: 'Fakhrulhilal M',
  url: 'https://blog.iroel.xyz',

  // Artalk (self-hosted comments, backed by Postgres/Neon).
  // `server` is wherever you deploy the Artalk backend (Fly.io, Render, a VPS...).
  // `site` must match the site name you register in Artalk's admin panel.
  artalk: {
    server: '', // e.g. "https://artalk.iroel.xyz" — leave empty to hide comments
    site: 'blog.iroel.xyz',
  },

  // PostHog analytics. Leave posthogKey empty to disable the snippet entirely.
  posthog: {
    key: '', // e.g. "phc_xxxxxxxx"
    apiHost: 'https://us.i.posthog.com', // or https://eu.i.posthog.com
  },
};
