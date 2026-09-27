import Slugger from 'github-slugger';
import type { SatteriProcessorOptions } from '@astrojs/markdown-satteri';

type HastPluginEntry = NonNullable<SatteriProcessorOptions['hastPlugins']>[number];

// Link icon (Octicons "link-16"), drawn with currentColor so it follows the text colour.
const linkIcon = {
  type: 'element',
  tagName: 'svg',
  properties: {
    viewBox: '0 0 16 16',
    width: 16,
    height: 16,
    fill: 'currentColor',
    ariaHidden: 'true',
  },
  children: [
    {
      type: 'element',
      tagName: 'path',
      properties: {
        d: 'm7.775 3.275 1.25-1.25a3.5 3.5 0 1 1 4.95 4.95l-2.5 2.5a3.5 3.5 0 0 1-4.95 0 .751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018 1.998 1.998 0 0 0 2.83 0l2.5-2.5a2.002 2.002 0 0 0-2.83-2.83l-1.25 1.25a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042Zm-4.69 9.64a1.998 1.998 0 0 0 2.83 0l1.25-1.25a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042l-1.25 1.25a3.5 3.5 0 1 1-4.95-4.95l2.5-2.5a3.5 3.5 0 0 1 4.95 0 .751.751 0 0 1-.018 1.042.751.751 0 0 1-1.042.018 1.998 1.998 0 0 0-2.83 0l-2.5 2.5a1.998 1.998 0 0 0 0 2.83Z',
      },
      children: [],
    },
  ],
};

/**
 * Gives every h2–h6 an id and appends a "#" permalink to it, like the headings on Microsoft Learn.
 * Astro's own heading-ids plugin runs after user plugins and keeps an id that is already set, so the
 * slugs here (github-slugger, same as Astro) also end up in `headings` for any table of contents.
 */
export const headingAnchors: HastPluginEntry = () => {
  const slugger = new Slugger();
  return {
    name: 'heading-anchors',
    element: {
      filter: ['h2', 'h3', 'h4', 'h5', 'h6'],
      visit(node, ctx) {
        const existing = node.properties?.id;
        const id = typeof existing === 'string' ? existing : slugger.slug(ctx.textContent(node));
        if (typeof existing !== 'string') ctx.setProperty(node, 'id', id);
        ctx.setProperty(node, 'className', ['heading-anchored']);
        ctx.appendChild(node, {
          type: 'element',
          tagName: 'a',
          properties: {
            href: `#${id}`,
            className: ['heading-anchor'],
            ariaLabel: `Permalink to “${ctx.textContent(node)}”`,
          },
          children: [linkIcon],
        } as never);
      },
    },
  };
};
