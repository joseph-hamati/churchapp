import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Target, BookOpen, Trophy } from 'lucide-react';

const actions = [
  { icon: Target, label: 'Missions', path: '/missions', color: 'bg-primary/10 text-primary' },
  { icon: Gift, label: 'Rewards', path: '/rewards', color: 'bg-secondary/10 text-secondary' },
  { icon: BookOpen, label: 'My Tasks', path: '/missions', color: 'bg-accent/10 text-accent' },
  { icon: Trophy, label: 'Rankings', path: '/leaderboard', color: 'bg-chart-4/10 text-chart-4' },
];

export default function QuickActions() {
  return (
    <div className="px-5 mt-6">
      <div className="grid grid-cols-4 gap-3">
        {actions.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Link
              to={action.path}
              className="flex flex-col items-center gap-2 py-3 rounded-2xl hover:bg-muted/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-muted-foreground">{action.label}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}