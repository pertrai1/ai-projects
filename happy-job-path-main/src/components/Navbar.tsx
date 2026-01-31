import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Briefcase, LayoutDashboard, KanbanSquare, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onAddApplication?: () => void;
}

export function Navbar({ onAddApplication }: NavbarProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const navItems = [
    { path: '/', label: 'Board', icon: KanbanSquare },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <nav className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-lg hidden sm:block">Job Tracker</span>
            </Link>
            <div className="flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    location.pathname === item.path
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onAddApplication && (
              <Button onClick={onAddApplication} size="sm" className="gradient-primary">
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Add Application</span>
              </Button>
            )}
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
