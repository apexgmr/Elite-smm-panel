import React, { useEffect, useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  Package,
  Activity,
  Database
} from 'lucide-react';
import { seedDatabase } from '@/lib/seedData';
import { toast } from 'sonner';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeServices: 0,
    pendingPayments: 0,
  });

  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  const handleSeed = async () => {
    try {
      const seeded = await seedDatabase();
      if (seeded) {
        toast.success('Sample services seeded successfully!');
        window.location.reload();
      } else {
        toast.info('Services already exist.');
      }
    } catch (error) {
      toast.error('Failed to seed database');
    }
  };

  useEffect(() => {
    // These would be real aggregation queries or cloud functions in a production app
    const fetchStats = async () => {
      const users = await FirestoreService.getCollection('users');
      const orders = await FirestoreService.getCollection('orders');
      const services = await FirestoreService.getCollection('services');
      const payments = await FirestoreService.getCollection('payments');

      setStats({
        totalUsers: users?.length || 0,
        totalOrders: orders?.length || 0,
        totalRevenue: (orders as any[])?.reduce((acc: number, curr: any) => acc + (curr.charge || 0), 0) || 0,
        activeServices: (services as any[])?.filter((s: any) => s.status === 'active').length || 0,
        pendingPayments: (payments as any[])?.filter((p: any) => p.status === 'pending').length || 0,
      });

      setRecentOrders((orders as any[])?.slice(0, 5) || []);
    };

    fetchStats();
  }, []);

  const data = [
    { name: 'Mon', orders: 12 },
    { name: 'Tue', orders: 19 },
    { name: 'Wed', orders: 32 },
    { name: 'Thu', orders: 25 },
    { name: 'Fri', orders: 28 },
    { name: 'Sat', orders: 35 },
    { name: 'Sun', orders: 40 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-amber-500">Admin Overview</h1>
          <p className="text-slate-400">Real-time statistics for Elite SMM Panel.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={handleSeed}>
            <Database className="mr-2 h-4 w-4" /> Seed Services
          </Button>
          {stats.pendingPayments > 0 && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-lg border border-red-500/20 text-sm font-bold animate-pulse">
              <AlertCircle className="h-4 w-4" />
              {stats.pendingPayments} New Payment Requests
            </div>
          )}
        </div>
      </div>

      {/* Admin Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-400' },
          { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-purple-400' },
          { title: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-green-400' },
          { title: 'Active Services', value: stats.activeServices, icon: Package, color: 'text-amber-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-slate-800 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-amber-500" />
              Order Growth
            </CardTitle>
            <CardDescription className="text-slate-400">Weekly order trends</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                  itemStyle={{ color: '#fbbf24' }}
                />
                <Bar dataKey="orders" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Recent System Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentOrders.map((order, i) => (
                <div key={i} className="flex items-center gap-4 border-l-2 border-slate-800 pl-4 py-1">
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">New Order #{order.id?.substring(0,6)}</p>
                    <p className="text-xs text-slate-400">{order.serviceName} - ${order.charge?.toFixed(2)}</p>
                  </div>
                  <span className="text-[10px] text-slate-500">2m ago</span>
                </div>
              ))}
              {recentOrders.length === 0 && <p className="text-center text-slate-500 py-12">No recent activity.</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
