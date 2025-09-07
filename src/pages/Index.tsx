import { useState, useMemo, useEffect } from "react";
import { getOrders, createOrder, updateOrder } from "@/integrations/supabase/client";
import { Order, DashboardMetrics } from "@/types";
import { Dashboard } from "@/components/Dashboard";
import { OrderForm } from "@/components/OrderForm";
import { OrdersList } from "@/components/OrdersList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Plus, Package } from "lucide-react";

const PAGE_PASSWORD = import.meta.env.VITE_PAGE_PASSWORD;

const Index = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders();
        setOrders(
          data.map(order => ({
            ...order,
            createdAt: order.created_at ? new Date(order.created_at) : undefined,
            completedAt: order.completed_at ? new Date(order.completed_at) : undefined,
            clientName: order.client_name,
            itemName: order.item_name
          }))
        );
      } catch (err) {
        console.error("Failed to fetch orders from Supabase", err);
      }
    }
    fetchOrders();
  }, []);

  type AddOrderData = Omit<Order, 'id' | 'createdAt' | 'completedAt'> & { paid?: boolean };

  const addOrder = async (orderData: AddOrderData) => {
    try {
      // Map camelCase to snake_case for Supabase
      const supabaseOrder = {
        client_name: orderData.clientName,
        item_name: orderData.itemName,
        price: orderData.price,
        cost: orderData.cost ?? null,
        address: orderData.address,
        status: orderData.status,
        paid: orderData.paid ?? false,
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      const newOrder = await createOrder(supabaseOrder);
      setOrders(prev => [
        {
          ...newOrder,
          createdAt: newOrder.created_at ? new Date(newOrder.created_at) : undefined,
          completedAt: newOrder.completed_at ? new Date(newOrder.completed_at) : undefined,
          clientName: newOrder.client_name,
          itemName: newOrder.item_name
        },
        ...prev
      ]);
    } catch (err) {
      console.error("Failed to add order to Supabase", err);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      // Map updates to snake_case
      const updates: any = { status };
      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      } else {
        updates.completed_at = null;
      }
      const updatedOrder = await updateOrder(orderId, updates);
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? {
              ...updatedOrder,
              createdAt: updatedOrder.created_at ? new Date(updatedOrder.created_at) : undefined,
              completedAt: updatedOrder.completed_at ? new Date(updatedOrder.completed_at) : undefined,
              clientName: updatedOrder.client_name,
              itemName: updatedOrder.item_name
            }
          : order
      ));
    } catch (err) {
      console.error("Failed to update order in Supabase", err);
    }
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
  
  // Password check
  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <form
          className="bg-white p-8 rounded shadow-md flex flex-col gap-4 w-full max-w-xs"
          onSubmit={e => {
            e.preventDefault();
            if (passwordInput === PAGE_PASSWORD) {
              setAuthenticated(true);
              setPasswordError("");
            } else {
              setPasswordError("Incorrect password. Please try again.");
            }
          }}
        >
          <h2 className="text-2xl font-bold mb-2">Enter Password</h2>
          <input
            type="password"
            className="border rounded px-3 py-2"
            placeholder="Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            autoFocus
          />
          {passwordError && (
            <div className="text-red-500 text-sm">{passwordError}</div>
          )}
          <button
            type="submit"
            className="bg-primary text-white rounded px-4 py-2 font-semibold"
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

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