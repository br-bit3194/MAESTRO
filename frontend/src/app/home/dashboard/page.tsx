import { DashboardMetrics } from "@/components/ui/dashboard-metrics";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      <div className="space-y-4">
        <DashboardMetrics />
        {/* Additional dashboard content can go here */}
      </div>
    </div>
  );
}
