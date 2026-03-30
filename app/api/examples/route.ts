import { createClient } from "@/backend/supabase/server";
import {
  createExampleSchema,
  listExamplesQuerySchema,
} from "@/backend/api/schemas";
import { failure, fromZodError, success } from "@/backend/api/responses";
import { hasEnvVars } from "@/lib/utils";
import { ZodError } from "zod";

export async function GET(request: Request) {
  if (!hasEnvVars) {
    return failure(
      "Missing Supabase environment variables",
      503,
      "MISSING_ENV_VARS",
    );
  }

  try {
    const url = new URL(request.url);
    const parsedQuery = listExamplesQuerySchema.parse({
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("api_examples")
      .select("id,title,details,user_id,created_at,updated_at")
      .order("created_at", { ascending: false })
      .limit(parsedQuery.limit);

    if (error) {
      return failure(error.message, 500, error.code);
    }

    return success({ items: data ?? [] });
  } catch (error) {
    if (error instanceof ZodError) {
      return fromZodError(error);
    }

    return failure("Unexpected error", 500, "UNEXPECTED_ERROR");
  }
}

export async function POST(request: Request) {
  if (!hasEnvVars) {
    return failure(
      "Missing Supabase environment variables",
      503,
      "MISSING_ENV_VARS",
    );
  }

  try {
    const payload = createExampleSchema.parse(await request.json());
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
      .insert({
        title: payload.title,
        details: payload.details ?? null,
        user_id: user.id,
      })
      .select("id,title,details,user_id,created_at,updated_at")
      .single();

    if (error) {
      return failure(error.message, 500, error.code);
    }

    return success(data, 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return fromZodError(error);
    }

    return failure("Unexpected error", 500, "UNEXPECTED_ERROR");
  }
}
