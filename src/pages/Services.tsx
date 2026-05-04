import React, { useEffect, useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function Services() {
  const { profile } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedService, setSelectedService] = useState<any>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [link, setLink] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('services', (data) => {
      setServices(data.filter(s => s.status === 'active'));
      const cats = Array.from(new Set(data.filter(s => s.status === 'active').map((s: any) => s.category)));
      setCategories(cats);
    });
    return () => unsubscribe();
  }, []);

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const estimatedCost = selectedService ? (quantity / 1000) * selectedService.pricePer1000 : 0;

  const handlePlaceOrder = async () => {
    if (!profile) return;
    if (quantity < selectedService.min || quantity > selectedService.max) {
      toast.error(`Quantity must be between ${selectedService.min} and ${selectedService.max}`);
      return;
    }
    if (!link) {
      toast.error('Please provide a valid link');
      return;
    }
    if (profile.balance < estimatedCost) {
      toast.error('Insufficient balance. Please add funds.');
      return;
    }

    setIsOrdering(true);
    try {
      // 1. Create the order
      const orderData = {
        userId: profile.uid,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        link,
        quantity,
        charge: estimatedCost,
        status: 'pending',
      };
      
      const orderId = await FirestoreService.addDocument('orders', orderData);

      // 2. Deduct balance
      await FirestoreService.updateDocument('users', profile.uid, {
        balance: profile.balance - estimatedCost
      });

      // 3. (Optional) Call Provider API via our Express backend
      // We'll mock this for now as a fetch to our local server
      if (selectedService.providerId) {
        fetch('/api/provider/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ service: selectedService.providerServiceId, link, quantity })
        }).then(res => res.json()).then(data => {
          if (data.order) {
            FirestoreService.updateDocument('orders', orderId!, { providerOrderId: data.order });
          }
        });
      }

      toast.success('Order placed successfully!');
      setIsDialogOpen(false);
      setQuantity(0);
      setLink('');
    } catch (error: any) {
      toast.error('Failed to place order: ' + error.message);
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-slate-500">Browse and order from our wide range of social media services.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search services..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rate per 1k</TableHead>
                <TableHead>Min / Max</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No services found. Try a different search or category.
                  </TableCell>
                </TableRow>
              ) : (
                filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-mono text-xs">{service.id?.substring(0, 5)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-xs text-slate-500">{service.category}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-600">${service.pricePer1000.toFixed(2)}</TableCell>
                    <TableCell className="text-sm">
                      {service.min} / {service.max}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog open={isDialogOpen && selectedService?.id === service.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if(open) setSelectedService(service);
                      }}>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <ShoppingCart className="mr-2 h-4 w-4" /> Order
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Place New Order</DialogTitle>
                            <DialogDescription>
                              {service.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="link">Link</Label>
                              <Input 
                                id="link" 
                                placeholder="https://instagram.com/p/..." 
                                value={link}
                                onChange={(e) => setLink(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="quantity">Quantity (Min: {service.min}, Max: {service.max})</Label>
                              <Input 
                                id="quantity" 
                                type="number" 
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                              />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg flex justify-between items-center">
                              <span className="text-sm font-medium text-slate-500">Total Charge:</span>
                              <span className="text-lg font-bold text-slate-900">${estimatedCost.toFixed(2)}</span>
                            </div>
                            {profile && profile.balance < estimatedCost && (
                              <p className="text-xs text-red-500 font-medium">Insufficient balance! You have ${profile.balance.toFixed(2)}</p>
                            )}
                          </div>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handlePlaceOrder} disabled={isOrdering || !link || quantity < service.min}>
                              {isOrdering ? 'Placing...' : 'Confirm Order'}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
