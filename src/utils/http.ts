import type { ZodError } from "zod";

export function response(status: number, body?: unknown) {
  return new Response(body ? JSON.stringify(body) : "", {
    headers: { "content-type": "application/json" },
    status,
  });
}

export function expiredSignatureResponse() {
  return response(410, {
    error: "Page Expired",
    message: "That link is no longer usable.",
  });
}

export function internalErrorResponse() {
  return response(500, {
    error: "Internal Server Error",
    message: "Please try again later.",
  });
}

export function invalidSignatureResponse() {
  return response(403, {
    error: "Invalid Signature",
    message: "The URL cannot be modified.",
  });
}

export function notFoundResponse() {
  return response(404, {
    error: "Not Found",
  });
}

export function retryCaptchaResponse() {
  return response(422, { captcha_token: ["retry"] });
}

export function validationErrorResponse(error: ZodError) {
  return response(422, error.flatten().fieldErrors);
}
