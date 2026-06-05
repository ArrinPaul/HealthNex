"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './Logo';
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
  Activity,
  Lock,
  Heart,
  LayoutGrid,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

export default function Navigation({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean; 
  setIsCollapsed: (v: boolean) => void 
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super-admin', 'admin', 'health-worker', 'community-user'] },
    { href: '/health-data', label: 'Health Data', icon: FileText, roles: ['super-admin', 'admin', 'health-worker'] },
    { href: '/water-quality', label: 'Water Quality', icon: Droplet, roles: ['super-admin', 'admin', 'health-worker'] },
    { href: '/ai-features', label: 'AI Insights', icon: Activity, roles: ['super-admin', 'admin', 'health-worker'] },
    { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['super-admin', 'admin', 'health-worker'] },
    { href: '/education', label: 'Education', icon: BookOpen, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'] },
    { href: '/community-reports', label: 'Community', icon: MessageSquare, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'] },
    { href: '/vault', label: 'My Vault', icon: Lock, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'] },
    { href: '/resources', label: 'Health Hub', icon: Heart, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'] },
    { href: '/user-management', label: 'User Mgmt', icon: User, roles: ['super-admin', 'admin', 'health-worker'] },
    { href: '/admin', label: 'Admin', icon: Settings, roles: ['super-admin', 'admin'] },
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
    <div className={`flex flex-col h-full py-6 transition-all duration-300 ${isCollapsed ? 'items-center' : ''}`}>
      <div className="flex flex-col gap-2 px-3 w-full">
        {!isCollapsed && <div className="px-3 mb-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.3em]">General</div>}
        {filteredNavItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`flex flex-col gap-1.5 px-4 py-3 rounded-xl border theme-transition group transition-all duration-300 ${
                isActive
                  ? 'bg-primary/15 text-foreground border-primary/30 shadow-[0_12px_30px_-20px_rgba(0,217,255,0.6)] font-semibold'
                  : 'text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground'
              } ${isCollapsed ? 'items-center px-0' : ''}`}
            >
              <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span className="text-xs uppercase font-semibold tracking-widest truncate">{item.label}</span>}
              </div>
              {!isCollapsed && (
                <div className="w-full h-[2px] bg-current opacity-[0.08] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: isActive ? '100%' : `${20 + (i * 7) % 50}%` }}
                    animate={isActive ? { width: '100%' } : { width: [`${20 + (i * 7) % 50}%`, `${30 + (i * 3) % 40}%`, `${20 + (i * 7) % 50}%`] }}
                    transition={isActive ? { duration: 0.5 } : { duration: 3 + (i % 3), repeat: Infinity, ease: "linear" }}
                    className={`h-full ${isActive ? 'bg-primary' : 'bg-current opacity-40'}`} 
                  />
                </div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-2 px-3 pt-6 border-t border-[var(--border-soft)] w-full">
        {!isCollapsed && <div className="px-3 mb-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.3em]">Account</div>}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border theme-transition transition-all duration-300 ${
                isActive
                  ? 'bg-primary/15 text-foreground border-primary/30 shadow-[0_12px_30px_-20px_rgba(0,217,255,0.6)] font-semibold'
                  : 'text-muted-foreground border-transparent hover:border-primary/20 hover:text-foreground'
              } ${isCollapsed ? 'justify-center px-0' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span className="text-xs uppercase font-semibold tracking-widest truncate">{item.label}</span>}
            </Link>
          );
        })}
        
        {!isCollapsed ? (
          <div className="mt-4 p-6 bg-[var(--surface-2)] border border-[var(--border-soft)] rounded-2xl theme-transition relative overflow-hidden group/ad">
            <Sparkles className="w-10 h-10 text-primary/10 absolute -right-2 -top-2 group-hover/ad:text-primary/20 transition-colors" />
            <div className="relative z-10">
              <div className="h-2 w-20 bg-primary/30 rounded-full mb-3" />
              <div className="h-1.5 w-full bg-primary/10 rounded-full mb-2" />
              <div className="h-1.5 w-3/4 bg-primary/10 rounded-full mb-6" />
              
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
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4">
             <Button
                onClick={() => logout()}
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl"
             >
                <LogOut className="w-4 h-4" />
             </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--surface-1)]/90 backdrop-blur border-b border-[var(--border-soft)] px-4 h-16 flex items-center justify-between theme-transition">
        <Logo size="sm" />
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 border border-[var(--border-soft)]">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 flex flex-col p-0 bg-[var(--surface-1)] border-r border-[var(--border-soft)] theme-transition">
            <div className="p-8 border-b border-[var(--border-soft)]">
              <Logo size="md" />
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-[var(--surface-1)] border-r border-[var(--border-soft)] flex-col z-40 theme-transition transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}>
        <div className={`p-8 border-b border-[var(--border-soft)] flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}>
          {!isCollapsed ? <Logo size="md" /> : <Logo size="sm" />}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-20 bg-background border border-[var(--border-soft)] w-6 h-6 rounded-full shadow-lg z-50 hover:bg-primary hover:text-primary-foreground transition-all ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {user && !isCollapsed && (
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

        {user && isCollapsed && (
          <div className="py-6 border-b border-[var(--border-soft)] bg-[var(--surface-2)] flex justify-center theme-transition">
             <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-lg font-semibold">
                {user.name.charAt(0)}
             </div>
          </div>
        )}

        <NavContent />
      </aside>
    </>
  );
}
