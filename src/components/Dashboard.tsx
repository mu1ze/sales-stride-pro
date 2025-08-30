import { Card } from "@/components/ui/card";
import { DashboardMetrics } from "@/types";
import { TrendingUp, DollarSign, Package, CheckCircle } from "lucide-react";

interface DashboardProps {
  metrics: DashboardMetrics;
}

const MetricCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string; 
  icon: any; 
  trend?: string; 
}) => (
  <Card className="p-6 bg-gradient-card shadow-card border-0 transition-smooth hover:shadow-lg">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend && (
          <p className="text-accent text-xs mt-1 flex items-center">
            <TrendingUp className="w-3 h-3 mr-1" />
            {trend}
          </p>
        )}
      </div>
      <div className="bg-gradient-primary p-3 rounded-lg">
        <Icon className="w-6 h-6 text-primary-foreground" />
      </div>
    </div>
  </Card>
);

export const Dashboard = ({ metrics }: DashboardProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-muted-foreground">
          Track your sales and orders
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Sales"
          value={`$${metrics.totalSales.toLocaleString()}`}
          icon={DollarSign}
          trend="+12% this month"
        />
        <MetricCard
          title="Total Profit"
          value={`$${metrics.totalProfit.toLocaleString()}`}
          icon={TrendingUp}
          trend={`${metrics.profitMargin.toFixed(1)}% margin`}
        />
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders.toString()}
          icon={Package}
        />
        <MetricCard
          title="Completed Orders"
          value={metrics.completedOrders.toString()}
          icon={CheckCircle}
          trend="+5 this week"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Weekly Revenue</span>
              <span className="font-semibold">${metrics.weeklyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monthly Revenue</span>
              <span className="font-semibold">${metrics.monthlyRevenue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Profit Margin</span>
              <span className="font-semibold text-accent">{metrics.profitMargin.toFixed(1)}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-card shadow-card border-0">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Average Order Value</span>
              <span className="font-semibold">
                ${((metrics.totalSales) / (metrics.pendingOrders + metrics.completedOrders) || 0).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Orders</span>
              <span className="font-semibold">{metrics.pendingOrders + metrics.completedOrders}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};