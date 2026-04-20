import { checkoutConfirmSchema } from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import { ConfirmCheckoutCommand } from "@/lib/patterns/commands/dashboard-commands";
import {
  withDashboardGuards,
  withValidatedBody,
} from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

const postHandler = withDashboardGuards(
  withValidatedBody(
    checkoutConfirmSchema,
    async (_request, _context, payload) => {
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new ConfirmCheckoutCommand(
        repositoryFactory.createCheckoutRepository(),
        payload,
      );
      const result = await command.execute();

      return success(result);
    },
  ),
);

export const POST = postHandler;
