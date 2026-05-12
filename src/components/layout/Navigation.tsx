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
import { motion } from 'framer-motion';

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
    <>
      <div className="flex flex-col gap-2">
        <div className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Menu</div>
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="relative group"
            >
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-white/5'
              }`}>
                <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'group-hover:text-foreground'}`} />
                <span className="text-[15px]">{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeNav"
                    className="absolute inset-0 rounded-xl bg-primary/5 border border-primary/10 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-border/40">
        <div className="flex flex-col gap-1 mb-4">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-foreground' : ''}`} />
                <span className="text-[15px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/40 to-white/10 dark:from-white/10 dark:to-white/5 border border-white/20 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <ThemeToggle />
            <LanguageSelector />
          </div>
          <Button
            onClick={() => {
              logout();
              setOpen(false);
            }}
            variant="destructive"
            className="w-full justify-center gap-2 rounded-xl h-10 shadow-lg shadow-destructive/20 hover:shadow-destructive/30 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-white/20 dark:border-white/10 px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <Activity className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">HealthNex</span>
        </div>
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 flex flex-col p-6 glass border-r border-white/20">
            <div className="mb-8 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-display font-bold">HealthNex</h2>
                {user && <p className="text-xs text-muted-foreground capitalize">{user.role.replace('-', ' ')}</p>}
              </div>
            </div>
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Floating Sidebar */}
      <aside className="hidden lg:flex fixed left-6 top-6 bottom-6 w-72 rounded-3xl glass flex-col p-6 z-40 border border-white/20 dark:border-white/10 shadow-2xl shadow-black/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />
        
        <div className="relative mb-8 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold tracking-tight">
              HealthNex
            </h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Surveillance</p>
          </div>
        </div>

        {user && (
          <div className="relative mb-8 p-4 rounded-2xl bg-gradient-to-br from-white/50 to-white/20 dark:from-white/10 dark:to-white/5 border border-white/30 dark:border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-cyan-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate capitalize">{user.role.replace('-', ' ')}</p>
              </div>
            </div>
          </div>
        )}

        <NavContent />
      </aside>
    </>
  );
}