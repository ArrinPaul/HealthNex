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
  Activity,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Lock,
  Heart,
  ChevronRight,
  Bot
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
    { href: '/chatbot', label: 'Health AI', icon: Bot, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'] },
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
    <div className="flex flex-col h-full py-4 transition-all duration-300 overflow-hidden">
      {/* Scrollable menu links */}
      <div className="flex-1 overflow-y-auto px-3 w-full scrollbar-none space-y-1">
        {!isCollapsed && <div className="px-4 mb-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Menu</div>}
        {filteredNavItems.map((item, i) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-3 rounded-xl border transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary/[0.12] to-primary/[0.02] text-primary border-primary/20 shadow-[0_0_12px_rgba(var(--primary-rgb),0.02)]'
                  : 'text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground hover:border-border/50'
              } ${isCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'px-4 py-2.5'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-primary to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                />
              )}
              <Icon className={`w-4.5 h-4.5 shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground/80 group-hover:text-foreground group-hover:scale-115'}`} />
              {!isCollapsed && <span className={`text-sm font-semibold transition-all ${isActive ? 'text-primary' : ''}`}>{item.label}</span>}
              
              {!isCollapsed && isActive && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="ml-auto"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(0,217,255,0.8)] animate-pulse" />
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Fixed bottom controls */}
      <div className="mt-auto flex flex-col gap-1.5 px-3 pt-4 border-t border-border/40 w-full shrink-0 bg-transparent">
        {!isCollapsed && <div className="px-4 mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60">Account</div>}
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-3 rounded-xl border transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary/[0.12] to-primary/[0.02] text-primary border-primary/20 shadow-[0_0_12px_rgba(var(--primary-rgb),0.02)]'
                  : 'text-muted-foreground border-transparent hover:bg-secondary/40 hover:text-foreground hover:border-border/50'
              } ${isCollapsed ? 'justify-center w-10 h-10 p-0 mx-auto' : 'px-4 py-2.5'}`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-nav-indicator-bottom"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-primary to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                />
              )}
              <Icon className={`w-4.5 h-4.5 shrink-0 transition-all duration-300 ${isActive ? 'scale-110 text-primary' : 'text-muted-foreground/80 group-hover:text-foreground group-hover:scale-115'}`} />
              {!isCollapsed && <span className={`text-sm font-semibold transition-all ${isActive ? 'text-primary' : ''}`}>{item.label}</span>}
            </Link>
          );
        })}
        
        {!isCollapsed ? (
          <div className="mt-4 p-3 bg-secondary/30 border border-border/40 rounded-xl relative overflow-hidden backdrop-blur-sm">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <ThemeToggle className="flex-1 bg-card hover:bg-secondary transition-all" />
                <LanguageSelector />
              </div>
              <Button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                variant="outline"
                className="w-full justify-center gap-2 h-10 border-rose-500/20 bg-rose-500/5 text-rose-500 text-xs font-semibold hover:bg-rose-500 hover:text-white hover:border-rose-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.2)] transition-all rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-3 pb-2">
             <ThemeToggle className="bg-secondary/40 hover:bg-secondary" />
             <LanguageSelector compact />
             <Button
                onClick={() => logout()}
                variant="ghost"
                size="icon"
                className="w-10 h-10 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl border border-transparent hover:border-rose-500/20 transition-all"
                title="Sign Out"
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/90 backdrop-blur border-b border-border px-4 h-14 flex items-center justify-between">
        <Logo size="sm" />
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 border border-border">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 flex flex-col p-0 bg-card border-r border-border">
            <div className="p-5 border-b border-border">
              <Logo size="md" />
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-background/60 backdrop-blur-xl border-r border-border/40 flex-col z-40 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.08)] ${isCollapsed ? 'w-16' : 'w-64'}`}>
        <div className={`p-5 border-b border-border/40 flex items-center relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center">
              <Logo size="md" />
            </motion.div>
          ) : (
            <div className="flex items-center justify-center">
              <Logo size="sm" iconOnly />
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-16 bg-card border border-border/80 w-6 h-6 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.08)] z-50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {user && !isCollapsed && (
          <div className="p-4 border-b border-border/40 bg-secondary/20 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card/40 border border-border/30 hover:border-primary/20 transition-all duration-300">
              <div className="w-9 h-9 bg-gradient-to-tr from-primary to-cyan-400 text-white flex items-center justify-center rounded-lg font-bold text-sm shadow-[0_2px_8px_rgba(6,182,212,0.35)] shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-foreground">{user.name}</p>
                <p className="text-[10px] font-bold text-muted-foreground/80 tracking-widest uppercase truncate mt-0.5">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        {user && isCollapsed && (
          <div className="py-4 border-b border-border/40 bg-secondary/20 flex justify-center">
             <div className="w-9 h-9 bg-gradient-to-tr from-primary to-cyan-400 text-white flex items-center justify-center rounded-lg font-bold text-sm shadow-[0_2px_8px_rgba(6,182,212,0.35)]">
                {user.name.charAt(0)}
             </div>
          </div>
        )}

        <NavContent />
      </aside>
    </>
  );
}
