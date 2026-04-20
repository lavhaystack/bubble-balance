import { supplierIdSchema, updateSupplierSchema } from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import {
  DeleteSupplierCommand,
  UpdateSupplierCommand,
} from "@/lib/patterns/commands/dashboard-commands";
import {
  withDashboardGuards,
  withValidatedBody,
} from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const patchHandler = withDashboardGuards(
  withValidatedBody(
    updateSupplierSchema,
    async (_request, context: RouteContext, payload) => {
      const { id } = supplierIdSchema.parse(await context.params);
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new UpdateSupplierCommand(
        repositoryFactory.createSupplierRepository(),
        id,
        payload,
      );
      const supplier = await command.execute();

      return success(supplier);
    },
  ),
);

const deleteHandler = withDashboardGuards(
  async (_request: Request, context: RouteContext) => {
    const { id } = supplierIdSchema.parse(await context.params);
    const supabase = await createClient();
    const repositoryFactory = new SupabaseDashboardRepositoryFactory(supabase);
    const command = new DeleteSupplierCommand(
      repositoryFactory.createSupplierRepository(),
      id,
    );
    const result = await command.execute();

    return success(result);
  },
);

export const PATCH = patchHandler;
export const DELETE = deleteHandler;
