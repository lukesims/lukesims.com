# [lukesims.com](https://lukesims.com)

My personal website.

## Tech Stack

- Built with [Astro](https://astro.build) / [React](https://react.dev) / [Tailwind](https://tailwindcss.com) / [TypeScript](https://www.typescriptlang.org).
- [Vitest](https://vitest.dev) and [Playwright](https://playwright.dev) for testing.
- Content written in [MDX](https://mdxjs.com) and sourced via [content collections](https://docs.astro.build/en/guides/content-collections).
- Deployed to [Cloudflare Workers](https://workers.cloudflare.com) via [Astro's Cloudflare adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare).
- Emails sent through [Mailgun](https://www.mailgun.com) in production or [Mailpit](https://github.com/axllent/mailpit) in dev/testing.
- Errors monitored by [Sentry](https://sentry.io).
- Bots hindered by [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/).

## Development

Note: the `/content` directory is a submodule pointing to a separate private repository. This keeps my content out of the public source code while maintaining version tracking and CI/CD integration ([read more](https://lukesims.com/blog/separating-astro-content-and-code-with-git-submodules)). You'll need to provide your own content to run this locally.

### Requirements

- Node 24

### Setup

1. **Clone the repository:**

   ```sh
   git clone --recurse-submodules https://github.com/lukesims/lukesims.com.git
   ```

   ```sh
   cd lukesims.com
   ```

   Note: if you're not [@lukesims](https://github.com/lukesims) then you'll need to do a normal clone and update the submodule config to point to your own repo (or just use a bare folder).

1. **Install dependencies:**

   ```sh
   npm install
   ```

1. **Set up environment variables:**

   ```sh
   cp .env.example .env
   ```

1. **Edit `.env` with your values.**

1. **Set up wrangler:**

   ```sh
   cp wrangler.example.jsonc wrangler.jsonc
   ```

1. **Edit `wrangler.jsonc` with your values.**

1. **Start the dev server:**

   ```sh
   npm run dev
   ```

### Running Tests

To run the unit tests:

```sh
npm run test:unit
```

To run the end-to-end tests:

```sh
# Download Playwright browsers (if not already installed)
npx playwright install
# Build in test mode so emails go to Mailpit
npm run build -- --mode test
npm run test:e2e
```

### Vite Modes

The application behaves differently depending on the Vite mode:

#### `MODE=development` (default for `npm run dev`)

- All blog posts are visible regardless of publish date.
- Email sent via Mailgun (use the sandbox).
- Cloudflare adapter enabled.
- Rate limiting active (requires `EMAIL_RATE_LIMITER` binding).
- Turnstile uses test keys (no action/hostname validation).

#### `MODE=test` (`npm run build -- --mode test`)

- Required for unit tests (`npm run test:unit`).
- All blog posts are visible regardless of publish date.
- Email sent via **Mailpit** instead of Mailgun.
- Cloudflare adapter disabled (required for Vitest).
- Rate limiting skipped (no `EMAIL_RATE_LIMITER` binding).
- Turnstile uses test keys (no action/hostname validation).

#### `MODE=production` (default for `npm run build`)

- Only published blog posts shown (publish date must be in the past).
- Email sent via Mailgun.
- Cloudflare adapter enabled.
- Rate limiting active (requires `EMAIL_RATE_LIMITER` binding).
- Turnstile action/hostname validation enforced.

## License

[MIT](./LICENSE)
