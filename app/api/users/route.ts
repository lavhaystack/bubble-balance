import { createClient } from "@/backend/supabase/server";
import { failure, success } from "@/backend/api/responses";
import { hasEnvVars } from "@/lib/utils";

export async function GET() {
  if (!hasEnvVars) {
    return failure(
      "Missing Supabase environment variables",
      503,
      "MISSING_ENV_VARS",
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return failure("Unauthorized", 401, "UNAUTHORIZED");
  }

  return success({
    id: user.id,
    email: user.email,
    createdAt: user.created_at,
    lastSignInAt: user.last_sign_in_at,
  });
}
