'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, CheckCircle2, Clock, Database, AlertCircle, BarChart2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for the charts
const ticketData = [
  { date: '2025-10-01', tickets: 12 },
  { date: '2025-10-02', tickets: 18 },
  { date: '2025-10-03', tickets: 15 },
  { date: '2025-10-04', tickets: 22 },
  { date: '2025-10-05', tickets: 17 },
  { date: '2025-10-06', tickets: 10 },
  { date: '2025-10-07', tickets: 14 },
];

const statusData = [
  { name: 'Completed', value: 68, color: 'bg-green-500' },
  { name: 'In Progress', value: 15, color: 'bg-blue-500' },
  { name: 'Pending', value: 10, color: 'bg-yellow-500' },
  { name: 'Failed', value: 7, color: 'bg-red-500' },
];

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
};

const MetricCard = ({ title, value, icon, description, trend = 'neutral' }: MetricCardProps) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-4 w-4 text-muted-foreground">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className={`text-xs ${trendColors[trend]}`}>
            {trendIcons[trend]} {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Analytics Dashboard</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Tickets Processed"
          value="1,248"
          icon={<Activity className="h-4 w-4" />}
          description="+12% from last month"
          trend="up"
        />
        <MetricCard
          title="Success Rate"
          value="94.5%"
          icon={<CheckCircle2 className="h-4 w-4 text-green-500" />}
          description="+2.1% from last month"
          trend="up"
        />
        <MetricCard
          title="Avg. Resolution Time"
          value="2h 42m"
          icon={<Clock className="h-4 w-4 text-amber-500" />}
          description="-15m from last month"
          trend="up"
        />
        <MetricCard
          title="Memories Stored"
          value="2,845"
          icon={<Database className="h-4 w-4 text-blue-500" />}
          description="+201 this month"
          trend="up"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tickets Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart2 className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Tickets chart will be displayed here</p>
                <p className="text-xs text-muted-foreground">(Integration with charting library needed)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ticket Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statusData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color}`}
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3 p-3 hover:bg-muted/50 rounded-lg transition-colors">
                <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Ticket #{1000 + i} resolved</p>
                    <span className="text-xs text-muted-foreground">
                      {i + 1} hour{i !== 0 ? 's' : ''} ago
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {['Network issue', 'S3 access', 'API timeout', 'Login failure', 'Database query'][i]} was automatically resolved
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
