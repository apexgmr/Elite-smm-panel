import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, Shield, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function Profile() {
  const { profile, user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-slate-500 mt-2">Manage your account information and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user?.photoURL || ''} />
              <AvatarFallback className="bg-slate-900 text-white text-xl">
                {profile?.displayName?.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{profile?.displayName}</CardTitle>
              <CardDescription>{profile?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" /> Full Name
              </Label>
              <Input value={profile?.displayName} disabled />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email Address
              </Label>
              <Input value={profile?.email} disabled />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Role
              </Label>
              <Input value={profile?.role?.toUpperCase()} disabled />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Member Since
              </Label>
              <Input 
                value={profile?.createdAt ? format(new Date(profile.createdAt), 'MMMM dd, yyyy') : ''} 
                disabled 
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold mb-4">API Access</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Your API Key</span>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(profile?.uid || '');
                  alert('API Key copied to clipboard!');
                }}>
                  Copy Key
                </Button>
              </div>
              <p className="font-mono text-xs text-slate-500 break-all bg-white dark:bg-slate-900 p-2 border rounded">
                {profile?.uid}
              </p>
              <p className="text-[10px] text-slate-500">
                Use this API key in your own panel or script to automate orders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
