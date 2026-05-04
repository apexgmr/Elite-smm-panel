import React, { useEffect, useState } from 'react';
import { FirestoreService } from '@/lib/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Check, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('payments', (data) => {
      setPayments(data);
    }, []);
    return () => unsubscribe();
  }, []);

  const handleApprove = async (payment: any) => {
    try {
      // 1. Update payment status
      await FirestoreService.updateDocument('payments', payment.id, { status: 'completed' });
      
      // 2. Fetch user to update balance (if it wasn't already updated by automated dummy)
      // In this app, the dummy gateway updates balance automatically, 
      // but for "manual" payments, the admin would do this.
      const userDoc = await FirestoreService.getDocument('users', payment.userId) as any;
      if (userDoc) {
        await FirestoreService.updateDocument('users', payment.userId, {
          balance: (userDoc.balance || 0) + payment.amount
        });
      }
      
      toast.success('Payment approved and balance updated');
    } catch (error) {
      toast.error('Approval failed');
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await FirestoreService.updateDocument('payments', paymentId, { status: 'rejected' });
      toast.success('Payment rejected');
    } catch (error) {
      toast.error('Rejection failed');
    }
  };

  return (
    <div className="space-y-6 text-white">
      <h1 className="text-3xl font-bold text-amber-500">Payment Requests</h1>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="border-slate-800">
              <TableRow className="border-slate-800 hover:bg-transparent">
                <TableHead className="text-slate-500">USER ID</TableHead>
                <TableHead className="text-slate-500">AMOUNT</TableHead>
                <TableHead className="text-slate-500">METHOD</TableHead>
                <TableHead className="text-slate-500">DATE</TableHead>
                <TableHead className="text-slate-500">STATUS</TableHead>
                <TableHead className="text-right text-slate-500">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No payment history.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(payment => (
                  <TableRow key={payment.id} className="border-slate-800 hover:bg-slate-800/50">
                    <TableCell className="text-xs text-slate-400 font-mono">
                      {payment.userId?.substring(0, 10)}...
                    </TableCell>
                    <TableCell className="font-bold text-green-400">${payment.amount?.toFixed(2)}</TableCell>
                    <TableCell className="text-xs uppercase">{payment.method}</TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {payment.createdAt ? format(new Date(payment.createdAt), 'MMM d, yyyy p') : ''}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                        payment.status === 'completed' ? 'bg-green-500/20 text-green-500' : 
                        payment.status === 'pending' ? 'bg-amber-500/20 text-amber-500' :
                        'bg-red-500/20 text-red-500'
                      }`}>
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status === 'pending' && (
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(payment)}>
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleReject(payment.id)}>
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      )}
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
