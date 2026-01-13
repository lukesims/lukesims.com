import * as Sentry from "@sentry/astro";

Sentry.init({
  debug: import.meta.env.PUBLIC_SENTRY_DEBUG === "true",
  dsn: import.meta.env.PUBLIC_SENTRY_DSN,
  environment: import.meta.env.PUBLIC_SENTRY_ENV,
  sendDefaultPii: false,
});
