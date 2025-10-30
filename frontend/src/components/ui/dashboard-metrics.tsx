"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, Clock, Database } from "lucide-react";

type MetricCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
};

const MetricCard = ({ title, value, icon, description }: MetricCardProps) => (
  <Card className="bg-white dark:bg-gray-800 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </CardTitle>
      <div className="h-4 w-4 text-muted-foreground">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
);

export function DashboardMetrics() {
  // These values would typically come from your API or state management
  const metrics = [
    {
      title: "Total Tickets Processed",
      value: "1,248",
      icon: <Activity className="h-4 w-4" />,
      description: "+12% from last month"
    },
    {
      title: "Success Rate",
      value: "94.5%",
      icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      description: "+2.1% from last month"
    },
    {
      title: "Memories Stored",
      value: "2,845",
      icon: <Database className="h-4 w-4 text-blue-500" />,
      description: "+201 this month"
    },
    {
      title: "Avg. Resolution Time",
      value: "2h 42m",
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      description: "-15m from last month"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
        />
      ))}
    </div>
  );
}
