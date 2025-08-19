Here is the **final complete prompt**, revised and production-ready for AI agent
execution:

---

Create a monorepo template using pnpm workspaces that will be used in the future
via a command like `npx create-metu@latest`. When run, the command should only
prompt for a project name, then scaffold the full structure and install all
dependencies automatically.

The monorepo should contain:

### 1. A frontend app (`apps/web`) built with:

- Next.js 15 using the App Directory with the latest features (server/client
  components)
- Tailwind CSS v3 (locked version) with dark mode, multiple color schemes,
  framer-motion animations, and `tailwind-animate`
- Firebase features:

  - Authentication (email/password and Google)
  - Messaging (push notifications)
  - Analytics (track all user actions)
  - Remote Config
  - Firestore, Realtime Database, and Storage with rules

- Internationalization using `i18next` + `i18next-browser-languagedetector`:

  - Supports English and Romanian
  - English is the default
  - No language prefix in URL—just updates dynamic content

- No hardcoded text, colors, spacing, or sizes
- PWA with manifest and service worker
- Folder architecture:

  - `components/` (with `ui/`, `layout/`, `forms/`, `features/`)
  - `hooks/`, `services/`, `providers/`, `store/`, `context/`, `utils/`,
    `types/`, `lib/`, `app/`

- Sample homepage with all sections
- UI elements:

  - Header, navbar, footer, sidebar, dropdowns, toast notifications
  - All primitives are custom-made; complex third-party components must be
    wrapped

- Libraries to use:

  - `zustand`, `zod`, `react-hot-toast`, `react-hook-form`, `react-window`,
    `react-firebase-hooks`, `react-email`, `resend`, `lodash`, `js-cookie`

- TypeScript strict mode: no `any`, no unused code, props, imports, or vars
- Modern architecture and clean code: modular, reusable, DRY, KISS, YAGNI, SOLID
- Debugging: timestamps, clean console logs
- Accessibility: ARIA, WCAG compliance
- SEO: structured data, meta tags, Open Graph, sitemap
- Performance: lazy loading, code splitting, bundle analysis
- Security: sanitization, input validation with `zod`
- Testing: Playwright in persistent browser mode
- Styling conventions: BEM, SMACSS, OOCSS
- Configuration: `.env`, `.env.example`, `next-safe-env`, `.gitignore`
- Deployment: Vercel and Firebase Hosting support

### 2. A backend app (`apps/backend`) using Fastify and Firebase Admin SDK:

- Structured for heavy backend tasks (jobs, server logic)
- Clean architecture: `routes/`, `plugins/`, `services/`, `utils/`, `types/`,
  main `app.ts`
- TypeScript strict mode
- Not yet connected to the frontend app

### 3. Shared packages:

- `packages/ui`: shared design system primitives
- `packages/config`: shared ESLint, TSConfig, Tailwind config, etc.
- `packages/utils`: common utility functions

### 4. CLI-ready:

- Include a CLI script (`create.mjs` or similar) to enable use via
  `npx create-metu@latest`

  - This script should prompt for project name, clone template, install
    packages, and initialize project

### 5. Additional project setup:

- Add `.env.example` with placeholders for all required Firebase keys and config
- Add GitHub Actions CI workflow for linting, type-checking, and Playwright
  tests
- Add `.github/copilot-instructions.md` to guide GitHub Copilot with
  architectural, naming, and code guidelines
- Include `README.md` (user-facing guide), and `DESCRIPTION.md` (architectural &
  rationale)
- Add `plop` or similar scaffolding generator for easily generating new tools,
  pages, or components
- Include a placeholder logo, font folder, and branding tokens in
  `tailwind.config.ts`
- Scaffold shared layout structure like `<AppShell>` or dashboard shell using
  route groups
- Ensure the system can be extended to native via WebView bridge in the future

Use pnpm with workspaces and Turborepo. Use latest stable versions of all
libraries except keep Tailwind locked to version 3. Follow clean code practices,
strong TypeScript typing, modular design, GitHub Copilot compatibility, and
scalable monorepo setup.

---

Before generating any code:

1. Plan the implementation and present it clearly.
2. Generate `README.md` – covers overview, usage, setup, deployment.
3. Generate `DESCRIPTION.md` – covers architecture, tech decisions, folder
   structure.
4. Generate `.github/copilot-instructions.md` – best practices and instructions
   for AI agents.
5. Ask me: **“Should I now start implementing the monorepo template?”**
