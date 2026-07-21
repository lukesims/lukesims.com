import * as Sentry from "@sentry/astro";
import {
  PUBLIC_SENTRY_DEBUG,
  PUBLIC_SENTRY_DSN,
  PUBLIC_SENTRY_ENV,
} from "astro:env/client";

Sentry.init({
  debug: PUBLIC_SENTRY_DEBUG === true,
  dsn: PUBLIC_SENTRY_DSN,
  environment: PUBLIC_SENTRY_ENV,
  sendDefaultPii: false,
});
