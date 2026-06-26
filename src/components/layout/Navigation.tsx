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
  Bot,
  Shield,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import LanguageSelector from './LanguageSelector';

const allNavItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super-admin', 'admin', 'health-worker', 'community-user'], color: 'from-blue-500/20 to-cyan-500/20', activeColor: 'text-blue-400' },
  { href: '/health-data', label: 'Health Data', icon: FileText, roles: ['super-admin', 'admin', 'health-worker'], color: 'from-emerald-500/20 to-teal-500/20', activeColor: 'text-emerald-400' },
  { href: '/water-quality', label: 'Water Quality', icon: Droplet, roles: ['super-admin', 'admin', 'health-worker'], color: 'from-cyan-500/20 to-blue-500/20', activeColor: 'text-cyan-400' },
  { href: '/ai-features', label: 'AI Insights', icon: Activity, roles: ['super-admin', 'admin', 'health-worker'], color: 'from-purple-500/20 to-pink-500/20', activeColor: 'text-purple-400' },
  { href: '/chatbot', label: 'Health AI', icon: Bot, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'], color: 'from-violet-500/20 to-purple-500/20', activeColor: 'text-violet-400' },
  { href: '/alerts', label: 'Alerts', icon: Bell, roles: ['super-admin', 'admin', 'health-worker'], color: 'from-rose-500/20 to-orange-500/20', activeColor: 'text-rose-400' },
  { href: '/education', label: 'Education', icon: BookOpen, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'], color: 'from-amber-500/20 to-yellow-500/20', activeColor: 'text-amber-400' },
  { href: '/community-reports', label: 'Community', icon: MessageSquare, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'], color: 'from-teal-500/20 to-emerald-500/20', activeColor: 'text-teal-400' },
  { href: '/vault', label: 'My Vault', icon: Lock, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'], color: 'from-slate-500/20 to-gray-500/20', activeColor: 'text-slate-400' },
  { href: '/resources', label: 'Health Hub', icon: Heart, roles: ['super-admin', 'admin', 'health-worker', 'community-user', 'public'], color: 'from-pink-500/20 to-rose-500/20', activeColor: 'text-pink-400' },
  { href: '/user-management', label: 'User Mgmt', icon: Users, roles: ['super-admin', 'admin', 'health-worker'], color: 'from-indigo-500/20 to-blue-500/20', activeColor: 'text-indigo-400' },
  { href: '/admin', label: 'Admin', icon: Shield, roles: ['super-admin', 'admin'], color: 'from-red-500/20 to-orange-500/20', activeColor: 'text-red-400' },
];

const allBottomNavItems = [
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help', icon: HelpCircle },
];

function NavContent({ 
  isCollapsed, 
  onLinkClick 
}: { 
  isCollapsed: boolean; 
  onLinkClick: () => void;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const filteredNavItems = allNavItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <div className="flex flex-col h-full transition-all duration-300 overflow-hidden">
      {/* Scrollable menu links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-none space-y-1">
        {!isCollapsed && (
          <div className="px-3 mb-2">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">Menu</div>
          </div>
        )}
        
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          const isHovered = hoveredItem === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? `bg-gradient-to-r ${item.color} ${item.activeColor} border border-current/20`
                  : 'text-muted-foreground hover:bg-secondary/40 hover:text-foreground border border-transparent'
              } ${isCollapsed ? 'justify-center w-9 h-9 p-0 mx-auto' : 'px-3 py-2'}`}
            >
              {isActive && (
                <div 
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-primary to-cyan-400 rounded-r-full shadow-[0_0_8px_rgba(6,182,212,0.6)]" 
                />
              )}
              
              <div className={`relative transition-all duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                <Icon className={`w-4 h-4 shrink-0 transition-colors duration-200 ${isActive ? item.activeColor : 'text-muted-foreground/60 group-hover:text-foreground'}`} />
              </div>
              
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <span className={`text-[13px] font-medium transition-all ${isActive ? item.activeColor : ''}`}>
                    {item.label}
                  </span>
                </div>
              )}
              
              {!isCollapsed && isActive && (
                <div className="shrink-0">
                  <div className={`w-1.5 h-1.5 rounded-full ${item.activeColor} shadow-[0_0_6px_currentColor] animate-pulse`} />
                </div>
              )}
              
              {isCollapsed && isHovered && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="absolute left-full ml-3 px-2.5 py-1 bg-card/95 backdrop-blur-md border border-border/60 rounded-lg shadow-xl z-50 pointer-events-none"
                >
                  <span className="text-xs font-medium text-foreground whitespace-nowrap">{item.label}</span>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Fixed bottom controls */}
      <div className="mt-auto flex flex-col gap-0.5 px-3 py-3 border-t border-border/30 w-full shrink-0 bg-gradient-to-t from-background/80 to-transparent">
        {!isCollapsed && (
          <div className="px-3 mb-1.5">
            <div className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50">Account</div>
          </div>
        )}
        
        {allBottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              title={isCollapsed ? item.label : ''}
              className={`relative flex items-center gap-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-primary/[0.12] to-primary/[0.02] text-primary border border-primary/20'
                  : 'text-muted-foreground border border-transparent hover:bg-secondary/40 hover:text-foreground'
              } ${isCollapsed ? 'justify-center w-9 h-9 p-0 mx-auto' : 'px-3 py-2'}`}
            >
              {isActive && (
                <div 
                  className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-gradient-to-b from-primary to-cyan-400 rounded-r-full shadow-[0_0_6px_rgba(6,182,212,0.5)]" 
                />
              )}
              <Icon className={`w-4 h-4 shrink-0 transition-all duration-200 ${isActive ? 'scale-105 text-primary' : 'text-muted-foreground/60 group-hover:text-foreground'}`} />
              {!isCollapsed && (
                <span className={`text-[13px] font-medium transition-all ${isActive ? 'text-primary' : ''}`}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
        
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="expanded"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 p-2.5 bg-card/50 border border-border/30 rounded-xl relative overflow-hidden backdrop-blur-sm"
            >
              <div className="relative z-10 space-y-2">
                <div className="flex items-center gap-2">
                  <ThemeToggle className="flex-1 h-8 bg-background/50 hover:bg-secondary transition-all text-xs" />
                  <LanguageSelector />
                </div>
                <Button
                  onClick={() => {
                    logout();
                    onLinkClick();
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center gap-1.5 h-8 text-rose-500 text-[11px] font-medium hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-lg"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="collapsed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mt-2 flex flex-col items-center gap-1.5"
            >
              <ThemeToggle className="w-9 h-9 bg-secondary/40 hover:bg-secondary rounded-lg" />
              <LanguageSelector compact />
              <Button
                onClick={() => logout()}
                variant="ghost"
                size="icon"
                className="w-9 h-9 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg border border-transparent hover:border-rose-500/20 transition-all"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Navigation({ 
  isCollapsed, 
  setIsCollapsed 
}: { 
  isCollapsed: boolean; 
  setIsCollapsed: (v: boolean) => void 
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Navigation Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border/40 px-4 h-12 flex items-center justify-between">
        <Logo size="sm" />
        
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 border border-border/40 hover:bg-secondary/60 transition-all">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 flex flex-col p-0 bg-card/98 backdrop-blur-2xl border-r border-border/40">
            <div className="p-4 border-b border-border/30">
              <Logo size="sm" />
            </div>
            <NavContent isCollapsed={false} onLinkClick={() => setOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Fixed Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 bottom-0 bg-gradient-to-b from-background/90 to-background/70 backdrop-blur-xl border-r border-border/30 flex-col z-40 transition-all duration-300 shadow-[2px_0_16px_rgba(0,0,0,0.06)] ${isCollapsed ? 'w-[60px]' : 'w-56'}`}>
        {/* Header with Logo */}
        <div className={`px-3 py-3 border-b border-border/30 flex items-center relative ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isCollapsed ? (
            <div className="flex items-center">
              <Logo size="sm" />
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Logo size="sm" iconOnly />
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`absolute -right-3 top-12 bg-card border border-border/60 w-6 h-6 rounded-full shadow-sm z-50 hover:bg-primary hover:text-primary-foreground transition-all duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
          >
            <ChevronRight className="w-3 h-3" />
          </Button>
        </div>

        {/* User Profile Card */}
        {user && !isCollapsed && (
          <div className="px-3 py-2.5 border-b border-border/30">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-card/40 border border-border/20 hover:border-primary/20 transition-all duration-200">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-cyan-400 text-white flex items-center justify-center rounded-lg font-bold text-xs shadow-sm shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-card rounded-full shadow-sm" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{user.name}</p>
                <p className="text-[9px] font-bold text-primary/70 tracking-wider uppercase truncate mt-0.5">
                  {user.role.replace('-', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {user && isCollapsed && (
          <div className="py-2.5 border-b border-border/30 flex justify-center">
            <div className="relative">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-cyan-400 text-white flex items-center justify-center rounded-lg font-bold text-xs shadow-sm">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-card rounded-full shadow-sm" />
            </div>
          </div>
        )}

        <NavContent isCollapsed={isCollapsed} onLinkClick={() => {}} />
      </aside>
    </>
  );
}
