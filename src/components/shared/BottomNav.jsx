import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Gift, Target, Trophy, User } from 'lucide-react';
import { useChurch } from '@/lib/churchContext';
import { cn } from '@/lib/utils';

const kidTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/missions', icon: Target, label: 'Missions' },
  { path: '/rewards', icon: Gift, label: 'Rewards' },
  { path: '/leaderboard', icon: Trophy, label: 'Rankings' },
  { path: '/profile', icon: User, label: 'Me' },
];

const parentTabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/progress', icon: Trophy, label: 'Progress' },
  { path: '/announcements', icon: Target, label: 'News' },
  { path: '/profile', icon: User, label: 'Me' },
];

const adminTabs = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/admin/students', icon: User, label: 'Students' },
  { path: '/admin/missions', icon: Target, label: 'Missions' },
  { path: '/admin/rewards', icon: Gift, label: 'Rewards' },
  { path: '/admin/more', icon: Trophy, label: 'More' },
];

export default function BottomNav() {
  const location = useLocation();
  const { currentUser } = useChurch();
  
  const role = currentUser?.user_type;
  const tabs = role === 'admin' || role === 'teacher' ? adminTabs : role === 'parent' ? parentTabs : kidTabs;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1">
        {tabs.map((tab) => {
          const isActive = tab.path === '/' 
            ? location.pathname === '/' 
            : location.pathname.startsWith(tab.path);
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all duration-200 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-primary/10 scale-110"
              )}>
                <tab.icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={cn(
                "text-[12px] font-semibold",
                isActive && "font-bold"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}