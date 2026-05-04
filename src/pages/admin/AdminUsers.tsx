import React, { useEffect, useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ShieldAlert, ShieldCheck, DollarSign, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await FirestoreService.getCollection('users');
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active';
    try {
      await FirestoreService.updateDocument('users', user.id, { status: newStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      toast.success(`User ${newStatus === 'banned' ? 'banned' : 'unbanned'} successfully`);
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser) return;
    try {
      const newBalance = (selectedUser.balance || 0) + balanceAmount;
      await FirestoreService.updateDocument('users', selectedUser.id, { balance: newBalance });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, balance: newBalance } : u));
      toast.success(`Added $${balanceAmount} to ${selectedUser.displayName}'s balance`);
      setSelectedUser(null);
      setBalanceAmount(0);
    } catch (error) {
      toast.error('Failed to update balance');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-amber-500">User Management</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Search by email or name..." 
          className="pl-10 bg-slate-900 border-slate-800 text-white"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-slate-900 border-slate-800 text-white">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500">USER</TableHead>
                <TableHead className="text-slate-500">EMAIL</TableHead>
                <TableHead className="text-slate-500">BALANCE</TableHead>
                <TableHead className="text-slate-500">STATUS</TableHead>
                <TableHead className="text-right text-slate-500">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-bold">{user.displayName}</TableCell>
                  <TableCell className="text-slate-400">{user.email}</TableCell>
                  <TableCell className="text-blue-400 font-mono">${user.balance?.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                      user.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                       <Dialog onOpenChange={(o) => !o && setSelectedUser(null)}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedUser(user)}>
                            <DollarSign className="h-4 w-4 text-green-500" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 text-white border-slate-800">
                          <DialogHeader>
                            <DialogTitle>Add Balance to {user.displayName}</DialogTitle>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <Label>Amount (USD)</Label>
                            <Input 
                              type="number" 
                              value={balanceAmount} 
                              onChange={e => setBalanceAmount(Number(e.target.value))}
                              className="bg-slate-800 border-slate-700"
                            />
                          </div>
                          <DialogFooter>
                            <Button onClick={handleAddBalance} className="bg-green-600 hover:bg-green-700 text-white">Add Funds</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleToggleStatus(user)}
                        className={user.status === 'active' ? 'text-red-400' : 'text-green-400'}
                      >
                        {user.status === 'active' ? <ShieldAlert className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                      </Button>
                    </div>
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
