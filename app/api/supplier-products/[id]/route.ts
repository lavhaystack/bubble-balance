import {
  supplierProductIdSchema,
  updateSupplierProductSchema,
} from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import {
  DeleteSupplierProductCommand,
  UpdateSupplierProductCommand,
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
    updateSupplierProductSchema,
    async (_request, context: RouteContext, payload) => {
      const { id } = supplierProductIdSchema.parse(await context.params);
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new UpdateSupplierProductCommand(
        repositoryFactory.createSupplierProductRepository(),
        id,
        payload,
      );
      const product = await command.execute();

      return success(product);
    },
  ),
);

const deleteHandler = withDashboardGuards(
  async (_request: Request, context: RouteContext) => {
    const { id } = supplierProductIdSchema.parse(await context.params);
    const supabase = await createClient();
    const repositoryFactory = new SupabaseDashboardRepositoryFactory(supabase);
    const command = new DeleteSupplierProductCommand(
      repositoryFactory.createSupplierProductRepository(),
      id,
    );
    const result = await command.execute();

    return success(result);
  },
);

export const PATCH = patchHandler;
export const DELETE = deleteHandler;
