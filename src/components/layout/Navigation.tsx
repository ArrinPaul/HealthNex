"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  Droplet, 
  Bell, 
  BookOpen, 
  MessageSquare,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'health-worker'] },
    { href: '/health-data', label: 'Health Data', icon: FileText, roles: ['admin', 'health-worker'] },
    { href: '/water-quality', label: 'Water Quality', icon: Droplet, roles: ['admin', 'health-worker'] },
    { href: '/ai-features', label: 'AI Insights', icon: Activity, roles: ['admin', 'health-worker'] },
    { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['admin', 'health-worker'] },
    { href: '/education', label: 'Education', icon: BookOpen, roles: ['admin', 'health-worker', 'community-user'] },
    { href: '/community-reports', label: 'Community', icon: MessageSquare, roles: ['admin', 'health-worker', 'community-user'] },
  ];

  const bottomNavItems = [
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/settings', label: 'Settings', icon: Settings },
    { href: '/help', label: 'Help', icon: HelpCircle },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="flex flex-col gap-2 px-3">
        <div className="px-3 mb-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.3em]">General</div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border theme-transition ${
                isActive
                  ? 'bg-primary/15 text-foreground border-primary/30 shadow-[0_12px_30px_-20px_rgba(0,217,255,0.6)] font-semibold'
                  : 'text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 px-3 pt-6 border-t border-[var(--border-soft)]">
        <div className="px-3 mb-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.3em]">Account</div>
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border theme-transition ${
                isActive
                  ? 'bg-primary/15 text-foreground border-primary/30 shadow-[0_12px_30px_-20px_rgba(0,217,255,0.6)] font-semibold'
                  : 'text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold tracking-widest">{item.label}</span>
            </Link>
          );
        })}
        
        <div className="mt-4 p-6 bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-2xl theme-transition">
          <div className="flex items-center justify-between mb-6">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <Button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            variant="outline"
            className="w-full justify-center gap-2 h-10 border border-[var(--border-strong)] bg-transparent text-foreground font-semibold uppercase text-[10px] tracking-widest hover:bg-primary/10 hover:border-primary/40 theme-transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--surface-1)]/90 backdrop-blur border-b border-[var(--border-soft)] px-4 h-16 flex items-center justify-between theme-transition">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center rounded-lg shadow-[0_0_18px_rgba(0,217,255,0.35)]">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tighter uppercase">HealthNex</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 border border-[var(--border-soft)]">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-0 bg-[var(--surface-1)] border-r border-[var(--border-soft)] theme-transition">
            <div className="p-8 border-b border-[var(--border-soft)] flex items-center gap-4">
              <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-xl shadow-[0_0_18px_rgba(0,217,255,0.35)]">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold leading-tight uppercase">HealthNex</h2>
              </div>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-72 bg-[var(--surface-1)] border-r border-[var(--border-soft)] flex-col z-40 theme-transition">
        <div className="p-8 border-b border-[var(--border-soft)] flex items-center gap-4">
          <div className="w-11 h-11 bg-primary text-primary-foreground flex items-center justify-center rounded-xl shadow-[0_0_22px_rgba(0,217,255,0.35)]">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tighter uppercase leading-none">
              HealthNex
            </h1>
            <p className="text-[10px] font-semibold text-primary tracking-[0.4em] uppercase mt-1">Intelligence</p>
          </div>
        </div>

        {user && (
          <div className="p-6 border-b border-[var(--border-soft)] bg-[var(--surface-2)] theme-transition">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-lg font-semibold shadow-[0_0_18px_rgba(0,217,255,0.25)]">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate uppercase">{user.name}</p>
                <p className="text-[10px] font-semibold text-muted-foreground truncate uppercase tracking-widest">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        <NavContent />
      </aside>
    </>
  );
}
