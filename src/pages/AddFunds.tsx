import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  CreditCard, 
  Banknote, 
  Bitcoin, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

export default function AddFunds() {
  const { profile } = useAuth();
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Amount must be greater than 0');
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Call Dummy Backend Gateway
      const response = await fetch('/api/payments/dummy-process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, method })
      });
      const data = await response.json();

      if (data.success) {
        // 2. Log payment in Firestore
        await FirestoreService.addDocument('payments', {
          userId: profile?.uid,
          amount,
          method,
          status: 'completed',
          transactionId: data.transactionId
        });

        // 3. Update user balance
        await FirestoreService.updateDocument('users', profile!.uid, {
          balance: (profile?.balance || 0) + amount
        });

        toast.success(`Successfully added $${amount} to your balance!`);
        setIsSuccess(true);
      }
    } catch (error: any) {
      toast.error('Payment failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto py-12">
        <Card className="text-center">
          <CardContent className="pt-12 pb-8 space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Payment Successful!</h2>
              <p className="text-slate-500 mt-2">
                $ {amount.toFixed(2)} has been added to your account balance.
              </p>
            </div>
            <Button className="w-full" onClick={() => {
              setIsSuccess(false);
              setAmount(0);
            }}>
              Add More Funds
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add Funds</h1>
        <p className="text-slate-500 mt-2">Choose your preferred payment method to top up your balance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'card', name: 'Credit Card', icon: CreditCard },
          { id: 'crypto', name: 'Crypto', icon: Bitcoin },
          { id: 'bank', name: 'Bank Transfer', icon: Banknote },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setMethod(item.id)}
            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
              method === item.id 
                ? 'border-slate-900 bg-slate-900 text-white shadow-lg' 
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Deposit Details</CardTitle>
          <CardDescription>Enter the amount you wish to deposit.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFunds} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <Input 
                  id="amount" 
                  type="number" 
                  className="pl-8" 
                  placeholder="0.00" 
                  min="1"
                  step="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  required
                />
              </div>
              <p className="text-xs text-slate-400">Minimum deposit: $1.00</p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div className="text-sm">
                <p className="font-bold">Dummy Integration Notice</p>
                <p className="mt-1">This is a simulation. No real money will be charged. Your balance will be updated instantly for testing purposes.</p>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-lg" disabled={isProcessing}>
              {isProcessing ? 'Processing Payment...' : `Pay $${amount || '0.00'}`}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="flex flex-wrap justify-center gap-6 grayscale opacity-50">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg" alt="Bitcoin" className="h-6" />
      </div>
    </div>
  );
}
