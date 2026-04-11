import { hasEnvVars } from "@/lib/utils";
import { success } from "@/lib/api/responses";

export async function GET() {
  return success({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseConfigured: Boolean(hasEnvVars),
  });
}
