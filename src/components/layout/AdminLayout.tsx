import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Package, 
  Users, 
  ClipboardList, 
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', icon: BarChart3, path: '/admin' },
    { name: 'Services', icon: Package, path: '/admin/services' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Orders', icon: ClipboardList, path: '/admin/orders' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform bg-slate-900 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <span className="text-xl font-bold text-amber-500">Admin Panel</span>
            <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                  (location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/'))
                    ? "bg-amber-500/10 text-amber-500"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            ))}
            
            <Link
              to="/dashboard"
              className="flex items-center px-4 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg mt-8"
            >
              <ChevronLeft className="h-5 w-5 mr-3" />
              Back to User Panel
            </Link>
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-800">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-400 hover:text-red-500 hover:bg-red-950/20"
              onClick={() => auth.signOut()}
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 bg-slate-900 border-b border-slate-800 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <span className="text-lg font-bold text-amber-500">Admin</span>
          <div className="w-10" />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
