import { createSupplierProductSchema } from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import { CreateSupplierProductCommand } from "@/lib/patterns/commands/dashboard-commands";
import {
  withDashboardGuards,
  withValidatedBody,
} from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

const postHandler = withDashboardGuards(
  withValidatedBody(
    createSupplierProductSchema,
    async (_request, _context, payload) => {
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new CreateSupplierProductCommand(
        repositoryFactory.createSupplierProductRepository(),
        payload,
      );
      const product = await command.execute();

      return success(product, 201);
    },
  ),
);

export const POST = postHandler;
