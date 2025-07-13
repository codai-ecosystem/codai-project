# METU Template Onboarding Checklist

Welcome to the METU Template! This checklist will help you get up and running
quickly.

## 🛠️ Initial Setup

- [ ] Clone the repository

  ```bash
  git clone https://github.com/your-username/metu-template.git
  cd metu-template
  ```

- [ ] Install pnpm (if not already installed)

  ```bash
  npm install -g pnpm
  ```

- [ ] Run the automated setup script

  ```bash
  pnpm setup
  ```

- [ ] Configure environment variables
  - Update `.env.local` with your Firebase configuration
  - Update `apps/web/.env.local` with Next.js specific variables
  - Update `apps/backend/.env.local` with backend specific variables

## 🔥 Firebase Setup

- [ ] Create a Firebase project at
      [firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication services
  - Email/Password
  - Google (optional)
- [ ] Create a Firestore database
- [ ] Set up Storage rules
- [ ] Download service account key for backend (if needed) - Place it in a
      secure location
  - Update `GOOGLE_APPLICATION_CREDENTIALS` in backend `.env.local`

## 💳 Stripe Setup (Optional)

Only complete this section if you plan to handle payments in your application.

- [ ] Create a Stripe account at [stripe.com](https://stripe.com)
- [ ] Get your API keys from the
      [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- [ ] Add Stripe keys to frontend environment (`apps/web/.env.local`):
  ```env
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
  ```
- [ ] Add Stripe keys to backend environment (`apps/backend/.env.local`):
  ```env
  STRIPE_SECRET_KEY=sk_test_your_key_here
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
  ```
- [ ] (Optional) Install Firebase Stripe extension if using Firebase:
  ```bash
  firebase ext:install stripe/firestore-stripe-payments
  ```

## 👩‍💻 Development Workflow

- [ ] Start the full development environment

  ```bash
  pnpm dev:all
  ```

- [ ] Start the web and backend servers (without Firebase emulators)

  ```bash
  pnpm dev:web
  ```

- [ ] Visit these URLs:
  - Next.js frontend: [http://localhost:6388](http://localhost:6388)
  - Backend API: [http://localhost:6389/docs](http://localhost:6389/docs)
  - Firebase Emulator UI: [http://localhost:4000](http://localhost:4000)

## 🧪 Testing

- [ ] Run unit tests

  ```bash
  pnpm test:unit
  ```

- [ ] Run E2E tests

  ```bash
  pnpm test:e2e
  ```

- [ ] Check test coverage
  ```bash
  pnpm test:coverage
  ```

## 🚀 Building for Production

- [ ] Build the project

  ```bash
  pnpm build
  ```

- [ ] Test the production build locally

  ```bash
  pnpm start
  ```

- [ ] Check bundle size
  ```bash
  pnpm analyze:bundle
  ```

## 📚 Resources

- [Project Documentation](./README.md)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Emulator Documentation](https://firebase.google.com/docs/emulator-suite)

---

**Having Trouble?** Check the [Troubleshooting Guide](./TROUBLESHOOTING.md) or
open an issue on GitHub.
