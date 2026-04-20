import { createSupplierSchema } from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import { CreateSupplierCommand } from "@/lib/patterns/commands/dashboard-commands";
import {
  withDashboardGuards,
  withValidatedBody,
} from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

const getHandler = withDashboardGuards(async (request: Request) => {
  void request;
  const supabase = await createClient();
  const repositoryFactory = new SupabaseDashboardRepositoryFactory(supabase);
  const items = await repositoryFactory.createSupplierRepository().list();

  return success({ items });
});

const postHandler = withDashboardGuards(
  withValidatedBody(
    createSupplierSchema,
    async (_request, _context, payload) => {
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new CreateSupplierCommand(
        repositoryFactory.createSupplierRepository(),
        payload,
      );
      const supplier = await command.execute();

      return success(supplier, 201);
    },
  ),
);

export const GET = getHandler;
export const POST = postHandler;
