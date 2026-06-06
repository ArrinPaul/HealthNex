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
    <div className={`flex flex-col h-full py-6 transition-all duration-300`}>
      <div className="flex flex-col gap-1.5 px-3 w-full">
        {!isCollapsed && <div className="px-4 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-50">General_Protocols</div>}
        {filteredNavItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_10px_25px_-15px_rgba(var(--primary-rgb),0.4)]'
                  : 'text-muted-foreground border-transparent hover:bg-[var(--surface-2)] hover:text-foreground'
              } ${isCollapsed ? 'justify-center px-0 mx-2' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" 
                />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-3'}`} />
              {!isCollapsed && <span className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? 'text-primary' : ''}`}>{item.label}</span>}
              
              {!isCollapsed && isActive && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex flex-col gap-1.5 px-3 pt-6 border-t border-[var(--border-soft)] w-full">
        {!isCollapsed && <div className="px-4 mb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.4em] opacity-50">Account_Sync</div>}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 group ${
                isActive
                  ? 'bg-primary/10 text-primary border-primary/20 shadow-[0_10px_25px_-15px_rgba(var(--primary-rgb),0.4)]'
                  : 'text-muted-foreground border-transparent hover:bg-[var(--surface-2)] hover:text-foreground'
              } ${isCollapsed ? 'justify-center px-0 mx-2' : ''}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator-bottom"
                  className="absolute left-0 w-1 h-6 bg-primary rounded-r-full shadow-[0_0_10px_var(--primary)]" 
                />
              )}
              <Icon className={`w-[18px] h-[18px] shrink-0 transition-transform duration-500 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              {!isCollapsed && <span className={`text-[11px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? 'text-primary' : ''}`}>{item.label}</span>}
            </Link>
          );
        })}
        
        {!isCollapsed ? (
          <div className="mt-6 p-6 bg-[var(--surface-2)]/50 border border-[var(--border-soft)] rounded-[2rem] theme-transition relative overflow-hidden group/ad">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--primary)_0%,transparent_70%)] opacity-5" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <ThemeToggle />
                <LanguageSelector />
              </div>
              <Button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                variant="outline"
                className="w-full justify-center gap-3 h-12 border-rose-500/20 bg-rose-500/5 text-rose-500 font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-500 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span>Terminate Session</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-4">
             <Button
                onClick={() => logout()}
                variant="ghost"
                size="icon"
                className="w-12 h-12 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl border border-transparent hover:border-rose-500/20 transition-all duration-500"
             >
                <LogOut className="w-5 h-5" />
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
