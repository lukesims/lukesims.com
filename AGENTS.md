# Agent Guidelines

## Foundational Context

Astro 7 site (React 19, Tailwind 4, TypeScript 5) deployed to Cloudflare Workers via `@astrojs/cloudflare`. Stack/toolchain versions are pinned in `package.json` — do not change dependencies without approval.

Node 24 (see `.node-version`). Vitest 4, Playwright, ESLint 9, Prettier 3, Wrangler 4.

## Repository Layout

- `src/`
  - App code: pages, components, layouts, middleware, schemas, stores, utils.
  - Path alias: `~/*` → `./src/*` (configured in `tsconfig.json`).
- `content/`
  - **Git submodule** pointing to a separate private content repo.
  - Required for any local dev/build: pages render from content collections.
  - CI clones with the submodule using `CONTENT_REPO_PAT`.
  - See `README.md` for setup; non-`@lukesims` users must repoint/replace it.
- `content/wrangler.jsonc`
  - The real Wrangler config. The root `wrangler.jsonc` is a **symlink** to it.
  - CI runs `cp content/wrangler.jsonc wrangler.jsonc` to flatten it before `astro build` (the build reads env bindings from it).
- `tests/e2e/`
  - Playwright tests
  - Excluded from Vitest via `vitest.config.ts`.
- `dist/`, `.astro/`, `.wrangler/`, `worker-configuration.d.ts` — generated/ignored by lint.

## Vite Modes (Important)

Defined in `astro.config.ts` + `src/config.ts`. Behavior differs per mode:

- `development` (`npm run dev`): all posts visible, Mailgun email, Cloudflare adapter on, rate limiting active (needs `EMAIL_RATE_LIMITER` binding), Turnstile test keys.
- `test` (`--mode test`): Mailpit instead of Mailgun, Cloudflare adapter **disabled** (required for Vitest), rate limiting skipped, all posts visible.
- `production` (`npm run build`): only already-published posts visible, Mailgun, adapter on, rate limiting active, Turnstile action/hostname enforced.

**Unit tests require test mode** (Vitest config calls `loadEnv("test", ...)`). **E2E tests require a `--mode test` build first.** `npm run test` runs unit + e2e concurrently — never run it from a clean checkout without building first.

## Developer Commands

Build/lint/test (npm scripts use `concurrently --group`):

```sh
npm run dev                     # dev server on http://localhost:8787 (NOT 4321)
npm run build -- --mode test    # build for tests
npm run build                   # production build (uses content submodule)
npm run lint                    # issues + style + types (concurrent)
npm run fix                     # eslint --fix + prettier --write (concurrent) — NO typecheck
npm run test:unit               # vitest run (single: npm run test:unit -- path/to/file)
npm run test:e2e                # playwright test (needs built dist/ in test mode)
npx playwright install          # required once before first e2e run
```

`fix` does not run `lint:types` (`astro check`). Run `npm run lint:types` separately when you've changed types.

## Verification (before finalizing changes)

1. `npm run fix`
2. `npm run lint:types`
3. `npm run build -- --mode test`
4. `npm run test:unit`
5. `npm run test:e2e` (only if touching pages/flows covered by e2e)

`npm run test` runs both suites concurrently and will fail e2e if `dist/` isn't built — prefer the explicit order above.

## Astro Dev Server

Use the `--background` flag to start a managed background dev server via opencode:

```sh
$ npm run dev -- --background
Dev server running at http://localhost:8787 (pid 12345)
  Stop:   astro dev stop
  Status: astro dev status
  Logs:   astro dev logs
```

Note the port is **8787** (set in `astro.config.ts`), not Astro's default 4321. `npm run preview` binds `0.0.0.0:8787` and is what Playwright's `webServer` starts during e2e runs.

## Conventions

- Follow existing code conventions; check sibling files first. Reuse existing components before creating new ones.
- Don't create new base directories without approval.
- Don't create documentation files (`*.md`) unless explicitly requested.
- `trailingSlash: "never"` — pages must not emit trailing slashes.
- Sentry opt-in via `SENTRY_ENABLED=true` env; disabled in dev/test by default.
- Secret env (Mailgun keys, HMAC, Turnstile, etc.) is declared in `astro.config.ts` `env.schema`. Public vars are prefixed `PUBLIC_`.
- Prettier: import sort order is third-party → `~/*` → relative. `tailwindFunctions: ["cn", "cva"]`. JSON/JSONC files have no trailing comma.

## MCP Server

An Astro Docs MCP server is registered in `opencode.json` providing `search_astro_docs`. **Search the Astro docs before implementing Astro features** to confirm current API/approach. Confirm with the user before using any Astro feature marked experimental.
