import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Order } from "@/types";
import { Plus } from "lucide-react";

interface OrderFormProps {
  onAddOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
}

export const OrderForm = ({ onAddOrder }: OrderFormProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    itemName: '',
    price: '',
    cost: '',
    address: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.itemName || !formData.price) {
      return;
    }

    onAddOrder({
      clientName: formData.clientName,
      itemName: formData.itemName,
      price: parseFloat(formData.price),
      cost: formData.cost ? parseFloat(formData.cost) : undefined,
      address: formData.address,
      status: 'pending'
    });

    setFormData({
      clientName: '',
      itemName: '',
      price: '',
      cost: '',
      address: ''
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="p-6 bg-gradient-card shadow-card border-0">
      <div className="flex items-center gap-2 mb-6">
        <div className="bg-gradient-primary p-2 rounded-lg">
          <Plus className="w-5 h-5 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-semibold">Add New Order</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              placeholder="Enter client name"
              value={formData.clientName}
              onChange={(e) => handleChange('clientName', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="itemName">Item Name *</Label>
            <Input
              id="itemName"
              placeholder="Enter item name"
              value={formData.itemName}
              onChange={(e) => handleChange('itemName', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Selling Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.price}
              onChange={(e) => handleChange('price', e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="cost">Cost (Optional)</Label>
            <Input
              id="cost"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.cost}
              onChange={(e) => handleChange('cost', e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            placeholder="Enter client address"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            rows={3}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-primary text-primary-foreground shadow-button hover:opacity-90 transition-smooth"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Order
        </Button>
      </form>
    </Card>
  );
};