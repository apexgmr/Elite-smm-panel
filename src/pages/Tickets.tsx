import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { FirestoreService } from '@/lib/firestore';
import { where, orderBy, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Plus, Send } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Tickets() {
  const { profile } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketMessage, setNewTicketMessage] = useState('');

  useEffect(() => {
    if (profile?.uid) {
      const unsubscribe = FirestoreService.subscribeToCollection(
        'tickets',
        (data) => setTickets(data),
        [where('userId', '==', profile.uid), orderBy('createdAt', 'desc')]
      );
      return () => unsubscribe();
    }
  }, [profile?.uid]);

  useEffect(() => {
    if (selectedTicket) {
      const unsubscribe = FirestoreService.subscribeToCollection(
        `tickets/${selectedTicket.id}/messages`,
        (data) => setMessages(data),
        [orderBy('createdAt', 'asc')]
      );
      return () => unsubscribe();
    }
  }, [selectedTicket]);

  const handleCreateTicket = async () => {
    if (!newTicketSubject || !newTicketMessage) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const ticketId = await FirestoreService.addDocument('tickets', {
        userId: profile?.uid,
        subject: newTicketSubject,
        status: 'open',
        lastMessageAt: new Date().toISOString(),
      });

      // Add first message
      await addDoc(collection(db, `tickets/${ticketId}/messages`), {
        ticketId,
        userId: profile?.uid,
        message: newTicketMessage,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      toast.success('Ticket created successfully!');
      setIsDialogOpen(false);
      setNewTicketSubject('');
      setNewTicketMessage('');
    } catch (error: any) {
      toast.error('Failed to create ticket: ' + error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await addDoc(collection(db, `tickets/${selectedTicket.id}/messages`), {
        ticketId: selectedTicket.id,
        userId: profile?.uid,
        message: newMessage,
        isAdmin: false,
        createdAt: new Date().toISOString()
      });

      await FirestoreService.updateDocument('tickets', selectedTicket.id, {
        status: 'open',
        lastMessageAt: new Date().toISOString()
      });

      setNewMessage('');
    } catch (error: any) {
      toast.error('Failed to send message: ' + error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-160px)]">
      {/* Ticket List */}
      <div className="lg:col-span-1 flex flex-col space-y-4 overflow-hidden">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" /> New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Open a Support Ticket</DialogTitle>
                <DialogDescription>
                  Explain your issue or question in detail.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input 
                    id="subject" 
                    placeholder="e.g. Order #12345 issue"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    placeholder="Describe your issue..." 
                    className="min-h-[100px]"
                    value={newTicketMessage}
                    onChange={(e) => setNewTicketMessage(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateTicket}>Create Ticket</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {tickets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-white dark:bg-slate-900 border rounded-lg">
              No tickets yet.
            </div>
          ) : (
            tickets.map(ticket => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 rounded-xl border transition-all hover:border-slate-400 ${
                  selectedTicket?.id === ticket.id 
                    ? 'border-slate-900 bg-white ring-1 ring-slate-900' 
                    : 'border-slate-200 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={
                    ticket.status === 'open' ? 'warning' as any :
                    ticket.status === 'answered' ? 'success' as any :
                    'secondary'
                  }>
                    {ticket.status}
                  </Badge>
                  <span className="text-xs text-slate-500">
                    {format(new Date(ticket.lastMessageAt), 'MMM d')}
                  </span>
                </div>
                <p className="font-bold text-slate-900 dark:text-white truncate">{ticket.subject}</p>
                <p className="text-xs text-slate-500 mt-1">ID: {ticket.id?.substring(0, 8)}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Message View */}
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold">{selectedTicket.subject}</h2>
                <p className="text-xs text-slate-500 italic">Ticket ID: {selectedTicket.id}</p>
              </div>
              {selectedTicket.status !== 'closed' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    FirestoreService.updateDocument('tickets', selectedTicket.id, { status: 'closed' });
                    setSelectedTicket({ ...selectedTicket, status: 'closed' });
                  }}
                >
                  Close Ticket
                </Button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
              {messages.map((msg, i) => (
                <div 
                  key={msg.id || i}
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.isAdmin 
                      ? 'self-start bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' 
                      : 'self-end bg-slate-900 text-white shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={`text-[10px] mt-2 opacity-50 ${msg.isAdmin ? 'text-slate-600' : 'text-slate-300'}`}>
                    {format(new Date(msg.createdAt), 'MMM d, p')}
                  </p>
                </div>
              ))}
              {messages.length === 0 && <p className="text-center text-slate-500 italic py-8">Loading messages...</p>}
            </div>

            {selectedTicket.status !== 'closed' ? (
              <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50">
                <div className="flex gap-2">
                  <Textarea 
                    placeholder="Type your message..." 
                    className="min-h-[60px] resize-none"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    className="self-end h-[60px] w-[60px] rounded-xl"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/50 border-t">
                <p className="text-slate-500 font-medium">This ticket is closed. You can no longer send messages.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500">
            <MessageCircle className="h-16 w-16 mb-4 opacity-10" />
            <h3 className="text-lg font-medium">No ticket selected</h3>
            <p>Select a ticket from the left or create a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
