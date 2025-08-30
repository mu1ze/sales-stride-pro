import { Order } from "@/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, MapPin, DollarSign, Clock, CheckCircle2 } from "lucide-react";

interface OrdersListProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const variants = {
    pending: "bg-orange-100 text-orange-700 border-orange-200",
    available: "bg-blue-100 text-blue-700 border-blue-200", 
    completed: "bg-green-100 text-green-700 border-green-200"
  };

  const icons = {
    pending: Clock,
    available: Package,
    completed: CheckCircle2
  };

  const Icon = icons[status];

  return (
    <Badge className={`${variants[status]} px-3 py-1 flex items-center gap-1`}>
      <Icon className="w-3 h-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const OrderCard = ({ 
  order, 
  onUpdateStatus 
}: { 
  order: Order; 
  onUpdateStatus: (orderId: string, status: Order['status']) => void; 
}) => {
  const profit = order.cost ? order.price - order.cost : null;
  const profitMargin = profit && order.price > 0 ? (profit / order.price) * 100 : null;

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0 transition-smooth hover:shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-lg">{order.clientName}</h3>
          <p className="text-muted-foreground">{order.itemName}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-medium">${order.price.toFixed(2)}</span>
          {profit && (
            <span className="text-accent">
              (${profit.toFixed(2)} profit)
            </span>
          )}
        </div>

        {order.address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{order.address}</span>
          </div>
        )}

        {profitMargin && (
          <div className="text-sm">
            <span className="text-muted-foreground">Profit Margin: </span>
            <span className="font-medium text-accent">{profitMargin.toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {order.status === 'pending' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'available')}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            Mark Available
          </Button>
        )}
        
        {order.status === 'available' && (
          <Button
            onClick={() => onUpdateStatus(order.id, 'completed')}
            className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90"
            size="sm"
          >
            Complete Order
          </Button>
        )}

        {order.status === 'completed' && (
          <div className="text-sm text-muted-foreground">
            Completed {order.completedAt?.toLocaleDateString()}
          </div>
        )}
      </div>
    </Card>
  );
};

export const OrdersList = ({ orders, onUpdateOrderStatus }: OrdersListProps) => {
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const availableOrders = orders.filter(order => order.status === 'available');
  const completedOrders = orders.filter(order => order.status === 'completed');

  const OrderSection = ({ 
    title, 
    orders, 
    emptyMessage 
  }: { 
    title: string; 
    orders: Order[]; 
    emptyMessage: string; 
  }) => (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title} ({orders.length})</h3>
      {orders.length === 0 ? (
        <Card className="p-8 text-center bg-gradient-card shadow-card border-0">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={onUpdateOrderStatus} 
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <OrderSection
        title="Pending Orders"
        orders={pendingOrders}
        emptyMessage="No pending orders"
      />
      
      <OrderSection
        title="Available Orders"
        orders={availableOrders}
        emptyMessage="No available orders"
      />
      
      <OrderSection
        title="Completed Orders"
        orders={completedOrders}
        emptyMessage="No completed orders yet"
      />
    </div>
  );
};