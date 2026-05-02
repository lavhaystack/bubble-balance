import {
  inventoryStockIdSchema,
  updateInventoryArchiveSchema,
} from "@/lib/api/schemas";
import { success } from "@/lib/api/responses";
import {
  DeleteInventoryStockCommand,
  UpdateInventoryArchiveCommand,
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

const deleteHandler = withDashboardGuards(
  async (_request: Request, context: RouteContext) => {
    const { id } = inventoryStockIdSchema.parse(await context.params);
    const supabase = await createClient();
    const repositoryFactory = new SupabaseDashboardRepositoryFactory(supabase);
    const command = new DeleteInventoryStockCommand(
      repositoryFactory.createInventoryRepository(),
      id,
    );
    const result = await command.execute();

    return success(result);
  },
);

const patchHandler = withDashboardGuards(
  withValidatedBody(
    updateInventoryArchiveSchema,
    async (_request: Request, context: RouteContext, payload) => {
      const { id } = inventoryStockIdSchema.parse(await context.params);
      const supabase = await createClient();
      const repositoryFactory = new SupabaseDashboardRepositoryFactory(
        supabase,
      );
      const command = new UpdateInventoryArchiveCommand(
        repositoryFactory.createInventoryRepository(),
        id,
        payload,
      );
      const result = await command.execute();

      return success(result);
    },
  ),
);

export const DELETE = deleteHandler;
export const PATCH = patchHandler;
