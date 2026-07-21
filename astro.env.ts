import type { AstroUserConfig } from "astro";
import { envField } from "astro/config";

export const env: NonNullable<NonNullable<AstroUserConfig["env"]>["schema"]> = {
  /**
   * Comma-separated list of allowed domains for SSR requests.
   *
   * Passed to the `security.allowedDomains` option in the Astro config.
   */
  ALLOWED_DOMAINS: envField.string({
    access: "public",
    context: "server",
    optional: true,
  }),

  /**
   * Email address that receives contact form submissions.
   */
  CONTACT_EMAIL: envField.string({
    access: "secret",
    context: "server",
  }),

  /**
   * Email address to use as the sender for transactional emails.
   */
  FROM_EMAIL: envField.string({
    access: "public",
    context: "server",
  }),

  /**
   * Algorithm to use when creating HMACs for URL signatures.
   *
   * The algorithm is dependent on the available algorithms supported by the
   * version of OpenSSL on the platform. Examples are 'sha256', 'sha512', etc.
   */
  HMAC_ALGO: envField.string({
    access: "public",
    context: "server",
    optional: true,
  }),

  /**
   * Secret key used when creating HMACs for URL signatures.
   */
  HMAC_KEY: envField.string({
    access: "secret",
    context: "server",
  }),

  /**
   * API key for Mailgun.
   */
  MAILGUN_API_KEY: envField.string({
    access: "secret",
    context: "server",
  }),

  /**
   * Base URL for Mailgun.
   */
  MAILGUN_BASE_URL: envField.string({
    access: "public",
    context: "server",
    url: true,
  }),

  /**
   * Domain for Mailgun.
   */
  MAILGUN_DOMAIN: envField.string({
    access: "public",
    context: "server",
  }),

  /**
   * URL for Mailpit.
   */
  MAILPIT_URL: envField.string({
    access: "secret",
    context: "server",
    optional: true,
    url: true,
  }),

  /**
   * URL for the repository.
   */
  PUBLIC_REPO_URL: envField.string({
    access: "public",
    context: "client",
    url: true,
  }),

  /**
   * Enables debug mode for Sentry when set to `true`.
   */
  PUBLIC_SENTRY_DEBUG: envField.boolean({
    access: "public",
    context: "client",
    optional: true,
    default: false,
  }),

  /**
   * DSN for Sentry.
   */
  PUBLIC_SENTRY_DSN: envField.string({
    access: "public",
    context: "client",
    optional: true,
    url: true,
  }),

  /**
   * Environment for Sentry.
   */
  PUBLIC_SENTRY_ENV: envField.string({
    access: "public",
    context: "client",
    optional: true,
  }),

  /**
   * URL for the site, e.g. `http://localhost:8787` or `https://lukesims.com`.
   *
   * Passed to the `site` option in the Astro config and it's also used to
   * configure Playwright for the end-to-end tests.
   */
  PUBLIC_SITE_URL: envField.string({
    access: "public",
    context: "client",
    url: true,
  }),

  /**
   * Turnstile site key for the site.
   */
  PUBLIC_TURNSTILE_SITE_KEY: envField.string({
    access: "public",
    context: "client",
  }),

  /**
   * Enables Sentry error tracking when set to `true`.
   */
  SENTRY_ENABLED: envField.boolean({
    access: "public",
    context: "server",
    optional: true,
    default: false,
  }),

  /**
   * Turnstile secret key for the site.
   */
  TURNSTILE_SECRET_KEY: envField.string({
    access: "secret",
    context: "server",
  }),
};
