import React, { useEffect, useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('orders', (data) => {
      setOrders(data);
    }, []);
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await FirestoreService.updateDocument('orders', orderId, { status: newStatus });
      toast.success('Order status updated');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = orders.filter(o => 
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.userId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-white text-slate-100">
      <h1 className="text-3xl font-bold text-amber-500">Global Orders</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Search by Order ID, Service, or User ID..." 
          className="pl-10 bg-slate-900 border-slate-800 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500">ID</TableHead>
                <TableHead className="text-slate-500">USER ID</TableHead>
                <TableHead className="text-slate-500">SERVICE</TableHead>
                <TableHead className="text-slate-500">QTY</TableHead>
                <TableHead className="text-slate-500">CHARGE</TableHead>
                <TableHead className="text-slate-500">STATUS</TableHead>
                <TableHead className="text-slate-500">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-mono text-[10px] text-slate-400">
                    {order.id?.substring(0, 10)}...
                  </TableCell>
                  <TableCell className="text-xs text-slate-400">
                    {order.userId?.substring(0, 8)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{order.serviceName}</span>
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 flex items-center hover:underline">
                        Link <ExternalLink className="ml-1 h-2 w-2" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs">{order.quantity}</TableCell>
                  <TableCell className="text-xs font-bold text-green-400">${order.charge?.toFixed(2)}</TableCell>
                  <TableCell>
                    <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="w-[120px] h-8 text-[11px] bg-slate-800 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, p') : ''}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
