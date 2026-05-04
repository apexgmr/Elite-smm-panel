import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { where, orderBy, limit } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wallet, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  ArrowRight
} from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

export default function Dashboard() {
  const { profile } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    processingOrders: 0,
  });

  useEffect(() => {
    if (profile?.uid) {
      // Fetch recent orders
      const unsubscribe = FirestoreService.subscribeToCollection(
        'orders',
        (data) => {
          setRecentOrders(data);
          const s = {
            totalOrders: data.length,
            completedOrders: data.filter(o => o.status === 'completed').length,
            processingOrders: data.filter(o => ['pending', 'processing'].includes(o.status)).length,
          };
          setStats(s);
        },
        [where('userId', '==', profile.uid), orderBy('createdAt', 'desc'), limit(5)]
      );

      return () => unsubscribe();
    }
  }, [profile?.uid]);

  const statCards = [
    { title: 'Total Balance', value: `$${profile?.balance?.toFixed(2)}`, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
    { title: 'Completed', value: stats.completedOrders, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'In Progress', value: stats.processingOrders, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {profile?.displayName}!</h1>
        <p className="text-slate-500 mt-2">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your last 5 service orders</CardDescription>
            </div>
            <Button variant="ghost" asChild>
              <Link to="/orders">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Charge</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No orders found. <Link to="/services" className="text-blue-600 hover:underline">Place your first order!</Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.serviceName}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>${order.charge.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          order.status === 'completed' ? 'success' as any :
                          ['pending', 'processing'].includes(order.status) ? 'warning' as any :
                          'destructive'
                        }>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {format(new Date(order.createdAt), 'MMM d, p')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Quick Actions / Tips */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500">
                Check our FAQ or open a support ticket if you have any issues with your orders.
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link to="/tickets">Open Ticket</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-amber-400" />
                Featured Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-300 mb-4">
                Instagram High Quality Followers is currently on sale! Boost your profile now.
              </p>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold border-none" asChild>
                <Link to="/services">Order Now</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
