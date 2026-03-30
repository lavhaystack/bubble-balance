import { createClient } from "@/backend/supabase/server";
import { exampleIdSchema, updateExampleSchema } from "@/backend/api/schemas";
import { failure, fromZodError, success } from "@/backend/api/responses";
import { hasEnvVars } from "@/lib/utils";
import { ZodError } from "zod";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!hasEnvVars) {
    return failure(
      "Missing Supabase environment variables",
      503,
      "MISSING_ENV_VARS",
    );
  }

  try {
    const { id } = exampleIdSchema.parse(await context.params);
    const payload = updateExampleSchema.parse(await request.json());
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return failure("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { data, error } = await supabase
      .from("api_examples")
      .update({
        title: payload.title,
        details:
          payload.details === undefined ? undefined : (payload.details ?? null),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id,title,details,user_id,created_at,updated_at")
      .single();

    if (error) {
      return failure(error.message, 500, error.code);
    }

    return success(data);
  } catch (error) {
    if (error instanceof ZodError) {
      return fromZodError(error);
    }

    return failure("Unexpected error", 500, "UNEXPECTED_ERROR");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!hasEnvVars) {
    return failure(
      "Missing Supabase environment variables",
      503,
      "MISSING_ENV_VARS",
    );
  }

  try {
    const { id } = exampleIdSchema.parse(await context.params);
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return failure("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { error } = await supabase
      .from("api_examples")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return failure(error.message, 500, error.code);
    }

    return success({ deleted: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return fromZodError(error);
    }

    return failure("Unexpected error", 500, "UNEXPECTED_ERROR");
  }
}
