export type ErrorResponse = {
  error: string;
  message?: string;
};

export function errorResponse(status: number, body: ErrorResponse) {
  return response(status, body);
}

export function response(status: number, body?: unknown) {
  return new Response(body ? JSON.stringify(body) : "", {
    headers: { "content-type": "application/json" },
    status,
  });
}
