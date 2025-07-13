# Web Application Template

A production-ready web application template powered by Next.js, TypeScript, and Tailwind CSS.

## Features

- ⚡ **Next.js 14** with App Router
- 🔷 **TypeScript** for type safety
- 🎨 **Tailwind CSS** for styling
- 🧩 **Component Library** ready
- 📱 **Responsive Design** built-in
- 🔍 **SEO Optimized** out of the box
- 🚀 **Performance Optimized**
- 🛠️ **Developer Experience** focused

## Quick Start

```bash
# Create new project from this template
npx create-codai-app my-app --template web-app

# Or clone directly
git clone https://github.com/codai-ecosystem/templates.git
cd templates/web-app
pnpm install
pnpm dev
```

## Tech Stack

- **Framework:** Next.js 14
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Components:** Radix UI
- **State:** Zustand
- **Testing:** Jest + Playwright
- **Linting:** ESLint + Prettier
- **CI/CD:** GitHub Actions

## Project Structure

```
web-app/
├── apps/
│   ├── web/          # Next.js frontend
│   └── backend/      # Fastify backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── utils/        # Shared utilities
│   └── config/       # Shared configurations
└── docs/             # Documentation
```

## Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development:**
   ```bash
   pnpm dev
   ```

3. **Open your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build for production
- `pnpm test` - Run tests
- `pnpm lint` - Lint and fix code
- `pnpm type-check` - Check TypeScript types

## Documentation

- [Getting Started](./docs/getting-started.md)
- [Deployment](./docs/deployment.md)
- [Contributing](./docs/contributing.md)

## License

MIT License - see [LICENSE](./LICENSE) for details.
