import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BarChart, 
  MapPin, 
  Activity, 
  Menu, 
  X,
  Download,
  FileText,
  Database,
  BookOpen
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout = ({ children, currentPage, onPageChange }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: Activity },
    { id: 'climate', name: 'Climate Impact', icon: BarChart },
    { id: 'documentation', name: 'Documentation', icon: BookOpen },
  ];

  const handleExport = (type: 'pdf' | 'csv') => {
    // Export functionality will be implemented in individual components
    console.log(`Exporting as ${type}`);
  };

  const handleNavigation = (item: typeof navigation[0]) => {
    if (item.external) {
      navigate(`/${item.id}`);
    } else {
      onPageChange(item.id);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <img src="/HealthPulse.png" alt="HealthPulse Logo" className="w-8 h-8 rounded-lg object-contain bg-white p-1" />
              <h1 className="text-lg font-semibold text-foreground">HealthPulse</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Button
                      variant={currentPage === item.id ? "default" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-all duration-200",
                        currentPage === item.id 
                          ? "bg-primary text-primary-foreground shadow-sm" 
                          : "hover:bg-accent"
                      )}
                      onClick={() => {
                        onPageChange(item.id);
                        setSidebarOpen(false);
                      }}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-4 h-4" />
              </Button>
              <h2 className="text-xl font-semibold text-foreground capitalize">
                {currentPage === 'dashboard' ? 'Analytics Dashboard' : 
                 currentPage === 'climate' ? 'Climate Impact Analysis' : 
                 currentPage === 'documentation' ? 'Dataset Documentation' :
                 'Outbreak Map Visualization'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Data
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
