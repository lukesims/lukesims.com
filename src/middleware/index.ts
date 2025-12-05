import { sequence } from "astro:middleware";

import { renderErrors } from "./render-errors";

export const onRequest = sequence(
  renderErrors, // <-- Must be first
  // ...
);
