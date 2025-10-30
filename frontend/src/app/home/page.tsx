import { SidebarDemo } from "@/components/ui/sidebar";
import { DashboardMetrics } from "@/components/ui/dashboard-metrics";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="h-screen flex flex-col">
        <SidebarDemo />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
            <div className="space-y-4">
              <DashboardMetrics />
              {/* Additional dashboard content can go here */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
