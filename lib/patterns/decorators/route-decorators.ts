import { z, ZodError } from "zod";

import { failure, fromZodError } from "@/lib/api/responses";
import { hasEnvVars } from "@/lib/utils";
import { isAppError } from "@/lib/patterns/errors/app-error";

type RouteHandler<TArgs extends unknown[]> = (
  ...args: TArgs
) => Promise<Response>;

export function withErrorBoundary<TArgs extends unknown[]>(
  handler: RouteHandler<TArgs>,
): RouteHandler<TArgs> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ZodError) {
        return fromZodError(error);
      }

      if (isAppError(error)) {
        return failure(error.message, error.status, error.code, error.details);
      }

      return failure("Unexpected error", 500, "UNEXPECTED_ERROR");
    }
  };
}

export function withEnvGuard<TArgs extends [Request, ...unknown[]]>(
  handler: RouteHandler<TArgs>,
): RouteHandler<TArgs> {
  return async (...args: TArgs) => {
    if (!hasEnvVars) {
      return failure(
        "Missing Supabase environment variables",
        503,
        "MISSING_ENV_VARS",
      );
    }

    return handler(...args);
  };
}

export function withValidatedBody<S extends z.ZodTypeAny, C = unknown>(
  schema: S,
  handler: (
    request: Request,
    context: C,
    payload: z.infer<S>,
  ) => Promise<Response>,
) {
  return async (request: Request, context: C) => {
    const payload = schema.parse(await request.json());
    return handler(request, context, payload);
  };
}

export function withDashboardGuards<TArgs extends [Request, ...unknown[]]>(
  handler: RouteHandler<TArgs>,
): RouteHandler<TArgs> {
  return withErrorBoundary(withEnvGuard(handler));
}
