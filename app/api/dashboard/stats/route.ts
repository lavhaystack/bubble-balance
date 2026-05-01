import { success } from "@/lib/api/responses";
import { FetchDashboardStatsCommand } from "@/lib/patterns/commands/dashboard-commands";
import { withDashboardGuards } from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

const getHandler = withDashboardGuards(
  async (_request, _context) => {
    const supabase = await createClient();
    const repositoryFactory = new SupabaseDashboardRepositoryFactory(
      supabase,
    );
    const command = new FetchDashboardStatsCommand(
      repositoryFactory.createStatsRepository(),
    );
    const result = await command.execute();

    return success(result);
  },
);

export const GET = getHandler;
