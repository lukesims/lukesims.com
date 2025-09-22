import { sequence } from "astro:middleware";

import { renderHttpErrors } from "./render-http-errors";
import { verifySignature } from "./verify-signature";

export const onRequest = sequence(renderHttpErrors, verifySignature);
