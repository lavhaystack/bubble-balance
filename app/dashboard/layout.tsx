// import { DashboardHeader } from "@/components/dashboard/header";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="flex min-h-screen flex-col md:flex-row">
        <DashboardSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* <DashboardHeader /> */}
          <main className="flex-1 overflow-auto p-8">{children}</main>
        </div>
      </div>
    </main>
  );
}
