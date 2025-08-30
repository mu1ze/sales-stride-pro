export interface Order {
  id: string;
  clientName: string;
  itemName: string;
  price: number;
  cost?: number;
  address: string;
  status: 'pending' | 'available' | 'completed';
  createdAt: Date;
  completedAt?: Date;
}

export interface DashboardMetrics {
  totalSales: number;
  totalProfit: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  profitMargin: number;
}