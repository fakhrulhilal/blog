import type { ShikiTransformer } from 'shiki';

// Display names for the header bar; anything missing falls back to the fence's language id.
const languageNames: Record<string, string> = {
  bash: 'Bash',
  sh: 'Shell',
  shell: 'Shell',
  zsh: 'Zsh',
  powershell: 'PowerShell',
  ps1: 'PowerShell',
  cmd: 'Command Prompt',
  bat: 'Batch',
  csharp: 'C#',
  cs: 'C#',
  fsharp: 'F#',
  vb: 'VB',
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  json: 'JSON',
  jsonc: 'JSON',
  yaml: 'YAML',
  yml: 'YAML',
  toml: 'TOML',
  ini: 'INI',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  sql: 'SQL',
  dockerfile: 'Dockerfile',
  diff: 'Diff',
  md: 'Markdown',
  markdown: 'Markdown',
  plaintext: 'Text',
  text: 'Text',
  txt: 'Text',
};

const copyIcon = {
  type: 'element',
  tagName: 'svg',
  properties: { viewBox: '0 0 16 16', width: 14, height: 14, fill: 'currentColor', ariaHidden: 'true' },
  children: [
    {
      type: 'element',
      tagName: 'path',
      properties: {
        d: 'M0 6.75C0 5.784.784 5 1.75 5h1.5a.75.75 0 0 1 0 1.5h-1.5a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-1.5a.75.75 0 0 1 1.5 0v1.5A1.75 1.75 0 0 1 9.25 16h-7.5A1.75 1.75 0 0 1 0 14.25Zm5-5C5 .784 5.784 0 6.75 0h7.5C15.216 0 16 .784 16 1.75v7.5A1.75 1.75 0 0 1 14.25 11h-7.5A1.75 1.75 0 0 1 5 9.25Zm1.75-.25a.25.25 0 0 0-.25.25v7.5c0 .138.112.25.25.25h7.5a.25.25 0 0 0 .25-.25v-7.5a.25.25 0 0 0-.25-.25Z',
      },
      children: [],
    },
  ],
};

/**
 * Wraps each highlighted block in a bordered frame with a header showing the language and a copy
 * button, like the code samples on Microsoft Learn. The click handler lives in PostLayout.astro.
 */
export const codeBlockFrame: ShikiTransformer = {
  name: 'code-block-frame',
  root(root) {
    const lang = this.options.lang;
    const label = languageNames[lang.toLowerCase()] ?? lang;
    root.children = [
      {
        type: 'element',
        tagName: 'div',
        properties: { className: ['code-block'] },
        children: [
          {
            type: 'element',
            tagName: 'div',
            properties: { className: ['code-block-header'] },
            children: [
              { type: 'element', tagName: 'span', properties: {}, children: [{ type: 'text', value: label }] },
              {
                type: 'element',
                tagName: 'button',
                properties: { type: 'button', className: ['code-copy'], ariaLabel: `Copy ${label} code` },
                children: [
                  copyIcon,
                  { type: 'element', tagName: 'span', properties: { className: ['code-copy-label'] }, children: [{ type: 'text', value: 'Copy' }] },
                ],
              },
            ],
          },
          ...(root.children as never[]),
        ],
      } as never,
    ];
  },
};
