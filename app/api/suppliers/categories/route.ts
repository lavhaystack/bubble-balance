import { success } from "@/lib/api/responses";
import { withDashboardGuards } from "@/lib/patterns/decorators/route-decorators";
import { SupabaseDashboardRepositoryFactory } from "@/lib/patterns/repositories/dashboard-repository-factory";
import { createClient } from "@/lib/supabase/server";

const getHandler = withDashboardGuards(async (request: Request) => {
  const url = new URL(request.url);
  const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  const supabase = await createClient();
  const repositoryFactory = new SupabaseDashboardRepositoryFactory(supabase);
  const items = await repositoryFactory
    .createSupplierProductRepository()
    .listCategories(query);

  return success({ items });
});

export const GET = getHandler;
