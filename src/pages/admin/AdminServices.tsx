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
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServices() {
  const [services, setServices] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    pricePer1000: 0,
    min: 0,
    max: 0,
    status: 'active',
    providerId: '',
    providerServiceId: ''
  });

  useEffect(() => {
    const unsubscribe = FirestoreService.subscribeToCollection('services', (data) => {
      setServices(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async () => {
    try {
      if (editingService) {
        await FirestoreService.updateDocument('services', editingService.id, formData);
        toast.success('Service updated successfully');
      } else {
        await FirestoreService.addDocument('services', formData);
        toast.success('Service added successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error('Error saving service: ' + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await FirestoreService.updateDocument('services', id, { status: 'inactive' });// Soft delete
        toast.success('Service marked as inactive');
      } catch (error: any) {
        toast.error('Error deleting service');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      pricePer1000: 0,
      min: 0,
      max: 0,
      status: 'active',
      providerId: '',
      providerServiceId: ''
    });
    setEditingService(null);
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-amber-500">Manage Services</h1>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 text-white border-slate-800">
            <DialogHeader>
              <DialogTitle>{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2 col-span-2">
                <Label>Service Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Price per 1000 ($)</Label>
                <Input type="number" value={formData.pricePer1000} onChange={e => setFormData({...formData, pricePer1000: Number(e.target.value)})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Min Order</Label>
                <Input type="number" value={formData.min} onChange={e => setFormData({...formData, min: Number(e.target.value)})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Max Order</Label>
                <Input type="number" value={formData.max} onChange={e => setFormData({...formData, max: Number(e.target.value)})} className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label>Service Status</Label>
                <Select value={formData.status} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Internal Provider ID (Optional)</Label>
                <Input value={formData.providerId} onChange={e => setFormData({...formData, providerId: e.target.value})} className="bg-slate-800 border-slate-700" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="text-white border-slate-700 hover:bg-slate-800">Cancel</Button>
              <Button onClick={handleSave} className="bg-amber-500 hover:bg-amber-600 text-slate-900">Save Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <Input 
          placeholder="Search all services..." 
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
                <TableHead className="text-slate-500">SERVICE</TableHead>
                <TableHead className="text-slate-500">CATEGORY</TableHead>
                <TableHead className="text-slate-500">RATE</TableHead>
                <TableHead className="text-slate-500">STATUS</TableHead>
                <TableHead className="text-right text-slate-500">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServices.map(service => (
                <TableRow key={service.id} className="border-slate-800 hover:bg-slate-800/50">
                  <TableCell className="font-bold">{service.name}</TableCell>
                  <TableCell>{service.category}</TableCell>
                  <TableCell className="text-green-400">${service.pricePer1000?.toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold ${
                      service.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {service.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => {
                        setEditingService(service);
                        setFormData(service);
                        setIsDialogOpen(true);
                      }}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4" />
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
