import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { where, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function Orders() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile?.uid) {
      const unsubscribe = FirestoreService.subscribeToCollection(
        'orders',
        (data) => setOrders(data),
        [where('userId', '==', profile.uid), orderBy('createdAt', 'desc')]
      );
      return () => unsubscribe();
    }
  }, [profile?.uid]);

  const filteredOrders = orders.filter(order => 
    order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.link.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-slate-500">Track all your previous and current service orders.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search orders..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ORDER ID</TableHead>
                <TableHead>DATE</TableHead>
                <TableHead>SERVICE</TableHead>
                <TableHead>LINK</TableHead>
                <TableHead>QUANTITY</TableHead>
                <TableHead>CHARGE</TableHead>
                <TableHead>STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-500">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.id?.substring(0, 8)}</TableCell>
                    <TableCell className="text-xs whitespace-nowrap">
                      {format(new Date(order.createdAt), 'MMM d, yyyy p')}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{order.serviceName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a href={order.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {order.link}
                      </a>
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell className="font-medium">${order.charge.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={
                        order.status === 'completed' ? 'success' as any :
                        ['pending', 'processing'].includes(order.status) ? 'warning' as any :
                        order.status === 'cancelled' ? 'destructive' : 'secondary'
                      }>
                        {order.status}
                      </Badge>
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
