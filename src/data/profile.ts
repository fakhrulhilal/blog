// Portfolio content for the home page. Seeded from github.com/fakhrulhilal/dotfiles
// and the public GitHub profile — edit freely.

export interface SocialLink {
  name: 'github' | 'linkedin' | 'devto' | 'telegram' | 'wakatime' | 'strava' | 'rss' | 'email';
  label: string;
  url: string;
}

export interface Project {
  name: string;
  url?: string;
  /** Link text shown instead of the raw URL. */
  urlText?: string;
  /** Square thumbnail next to the title, e.g. '/images/projects/foo.svg'. */
  image?: string;
  description: string;
  status?: string;
  tags?: string[];
}

export interface Job {
  company: string;
  url?: string;
  position: string;
  period: string;
}

export const profile = {
  name: 'Fakhrulhilal M',
  initials: 'FM',
  profession: 'Web Developer Specialist',
  image: 'https://github.com/fakhrulhilal.png',
  location: 'Jakarta, Indonesia',
  forHire: true,
  focus: 'Web APIs & developer tooling',
  stack: '.NET/C#, Bun/TS, Azure DevOps, Jira/Confluence',

  about: `A web developer specialising in the .NET stack. I like small, sharp tools: most of my day-to-day
automation lives in my dotfiles as C# file-based apps compiled with Native AOT, PowerShell modules and Bun
scripts.

Lately I've been building CLI tools for Kafka, Clockify and webhook, wiring up observability with
OpenTelemetry, and keeping one reproducible setup across macOS, Linux and Windows.

Proud to be cyclist 🚴, I ride my bike from/to the office whenever possible. Mostly mix with public transport.
So feel free to add my Strava and challenge me 😎
`,

  skills: ['.NET/C#/AoT', 'ASP.NET Core', 'PS/Bash', 'Microservice', 'OpenTelemetry', 'Azure DevOps'],

  tools: ['Rider/VScode', 'Neovim/Zed', 'Ghostty', 'mise/lazygit/fnox', 'docker/OrbStack'],
};

export const contact = {
  label: 'Telegram',
  handle: '@fakhrulhilal',
  url: 'https://t.me/fakhrulhilal',
};

export const social: SocialLink[] = [
  { name: 'github', label: 'GitHub', url: 'https://github.com/fakhrulhilal' },
  { name: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/in/fakhrulhilal' },
  { name: 'devto', label: 'DEV Community', url: 'https://dev.to/fakhrulhilal' },
  { name: 'telegram', label: `Telegram ${contact.handle}`, url: contact.url },
  { name: 'wakatime', label: 'WakaTime', url: 'https://wakatime.com/@fakhrulhilal' },
  { name: 'strava', label: 'Strava', url: 'https://www.strava.com/athletes/e-rule' },
  { name: 'rss', label: 'RSS feed', url: '/rss.xml' },
];

export const projects: Project[] = [
  {
    name: 'dotfiles',
    image: '/images/projects/dotfiles.svg',
    url: 'https://github.com/fakhrulhilal/dotfiles',
    description:
      'My shell experience for macOS, Linux and Windows: one bootstrap script that installs languages and CLI ' +
      'tools through mise, configures zsh/bash/PowerShell, Neovim and Git, and manages secrets with fnox. ' +
      'Contains day-to-day tools for development: scripting tool, docker container services, AI skills. ' +
      'I maintain my CLI tool using mise. ' +
      'This is the setup that I use to maintain several machines to work on. ',
    status: 'Active',
    tags: ['Shell', 'PowerShell', 'mise', 'secret', 'AI', 'dotfiles'],
  },
  {
    name: 'CLI tools',
    image: '/images/projects/cli.svg',
    url: 'https://github.com/fakhrulhilal/dotfiles#tools',
    urlText: 'fakhrulhilal/dotfiles/wiki',
    description:
      'Currated of CLI tool that I use in daily basis. Written as C# file-based app, and shipped as native AoT binary. ' +
      'Currently: dotkafka (Kafka client to manage topic along with its schema), dothook (dummy webhook service), dotclock (Clockify client). ',
    status: 'Released',
    tags: ['C#', 'Clockify', 'webhook', 'ASP.net', 'Kafka', 'Native AoT'],
  },
  {
    name: 'Tiny-HC',
    image: '/images/projects/health-check.svg',
    url: 'https://github.com/fakhrulhilal/tiny-hc',
    description: 'Very small tool to test health check, usefull for distroless container which is designed to be very minimum, even no shell in it. ' +
        'Inspired by microcheck, but lack of asserting response body. Built using Rust and delivered as pre-built binary or container. ' +
        'It has no dependency to any library and very small, less than 300KB. ' +
        'This is my first app which is built using Claude code from zero. ',
    status: 'Released',
    tags: ['Rust', 'container', 'health-check']
  },
  {
    name: 'Clean Architecture Kit',
    image: '/images/projects/clean-architecture.svg',
    url: 'https://github.com/fakhrulhilal/cleanarchitecture-kit',
    description: 'My a way-to-go for working with .NET project. Heavily inspired by Clean Architecture pattern from Jason Taylor. ' +
        'Adding standard for writing unit test, following AAA (Arrange-Act-Assert) pattern, and couple of other things to emphasize readability. ' +
        '',
    status: 'Archived',
    tags: ['.NET', 'design-pattern', 'template', 'architecture']
  },
  {
    name: 'TFSGitDownloader',
    url: 'https://github.com/fakhrulhilal/TFSGitDownloader',
    image: '/images/projects/tfs-git-downloader.png',
    description: 'My first Azure DevOps plugin which initially doesn\'t support cloning multiple repositories on build pipeline. ' +
        'Written in PowerShell script. ' +
        'It\'s been archived since the first day Azure DevOps add support resolving this issue. ',
    status: 'Archived',
    tags: ['Azure DevOps', 'PowerShell']
  }
];

// Placeholder work history (Microsoft's fictional sample companies) — replace with the real one. Newest first.
export const workHistory: Job[] = [
  {
    company: 'Hubexo/BCI Central',
    url: 'https://hubexo.com',
    position: 'Sr. Backend Engineer',
    period: 'Jun 2021 — Present',
  },
  {
    company: 'Verint Systems Inc.',
    url: 'https://www.verint.com',
    position: 'Senior Technical Consultant',
    period: 'Oct 2014 — Jun 2021',
  },
  {
    company: 'Sabre/Abacus Distribution Systems Indonesia, PT.',
    position: 'Programmer',
    period: 'Oct 2013 — Oct 2014',
  },
  {
    company: 'Indocyber Global Teknologi, PT.',
    position: '.NET Developer',
    period: 'Oct 2012 - Oct 2013'
  },
];
