import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { GraduationCap, LayoutDashboard, User, School, LogOut } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'Profile', icon: User, end: false },
  { to: '/colleges', label: 'Colleges', icon: School, end: false },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-60 shrink-0 border-r bg-background flex-col">
        <div className="px-6 py-6 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="font-heading font-semibold leading-tight">College OS</div>
            <div className="text-xs text-muted-foreground">Application co-pilot</div>
          </div>
        </div>
        <nav className="px-3 flex-1 space-y-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t">
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">{user?.email}</div>
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sign out</span>
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden sticky top-0 z-30 flex items-center justify-between gap-2 border-b bg-background px-4 h-14">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="font-heading font-semibold leading-tight truncate">College OS</div>
        </div>
        <Button variant="ghost" size="sm" className="text-muted-foreground shrink-0" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          <span className="text-xs">Sign out</span>
        </Button>
      </header>

      <main className="flex-1 min-w-0 pb-16 sm:pb-0">
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background flex">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 py-2 text-[11px] font-medium transition-colors',
                isActive ? 'text-indigo-700' : 'text-muted-foreground'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}