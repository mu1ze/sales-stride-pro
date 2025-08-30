import { useState, useMemo } from "react";
import { Order, DashboardMetrics } from "@/types";
import { Dashboard } from "@/components/Dashboard";
import { OrderForm } from "@/components/OrderForm";
import { OrdersList } from "@/components/OrdersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Plus, Package } from "lucide-react";

const Index = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      clientName: 'Sarah Johnson',
      itemName: 'Custom Wedding Cake',
      price: 450,
      cost: 180,
      address: '123 Main St, Springfield, IL',
      status: 'pending',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      clientName: 'Mike Chen',
      itemName: 'Birthday Cake Set',
      price: 120,
      cost: 45,
      address: '456 Oak Ave, Springfield, IL',
      status: 'available',
      createdAt: new Date('2024-01-16')
    },
    {
      id: '3',
      clientName: 'Emily Davis',
      itemName: 'Cupcake Dozen',
      price: 85,
      cost: 25,
      address: '789 Pine Rd, Springfield, IL',
      status: 'completed',
      createdAt: new Date('2024-01-10'),
      completedAt: new Date('2024-01-12')
    }
  ]);

  const addOrder = (orderData: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...orderData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setOrders(prev => [newOrder, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status,
            completedAt: status === 'completed' ? new Date() : order.completedAt
          }
        : order
    ));
  };

  const metrics: DashboardMetrics = useMemo(() => {
    const totalSales = orders
      .filter(order => order.status === 'completed')
      .reduce((total, order) => total + order.price, 0);
    
    const totalCost = orders
      .filter(order => order.status === 'completed' && order.cost)
      .reduce((total, order) => total + (order.cost || 0), 0);
    
    const totalProfit = totalSales - totalCost;
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyRevenue = orders
      .filter(order => 
        order.status === 'completed' && 
        order.completedAt && 
        order.completedAt >= weekAgo
      )
      .reduce((total, order) => total + order.price, 0);
    
    const monthlyRevenue = orders
      .filter(order => 
        order.status === 'completed' && 
        order.completedAt && 
        order.completedAt >= monthAgo
      )
      .reduce((total, order) => total + order.price, 0);
    
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const completedOrders = orders.filter(order => order.status === 'completed').length;
    const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

    return {
      totalSales,
      totalProfit,
      weeklyRevenue,
      monthlyRevenue,
      pendingOrders,
      completedOrders,
      profitMargin
    };
  }, [orders]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Quad Tracker
          </h1>
          <p className="text-muted-foreground mt-2">
            Professional client tracking and order management
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="add-order" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Order
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard metrics={metrics} />
          </TabsContent>

          <TabsContent value="add-order">
            <OrderForm onAddOrder={addOrder} />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersList 
              orders={orders} 
              onUpdateOrderStatus={updateOrderStatus} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;