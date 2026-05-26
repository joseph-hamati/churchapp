import React from 'react';
import { motion } from 'framer-motion';
import { Star, Gift, CheckCircle, Award } from 'lucide-react';
import moment from 'moment';

const categoryIcons = {
  attendance: CheckCircle,
  mission: Star,
  reward_redemption: Gift,
  manual: Award,
  video: Star,
  behavior: Award,
  event: Star,
};

const categoryColors = {
  attendance: 'text-accent',
  mission: 'text-primary',
  reward_redemption: 'text-destructive',
  manual: 'text-secondary',
  video: 'text-chart-5',
  behavior: 'text-accent',
  event: 'text-chart-4',
};

export default function RecentActivity({ transactions = [] }) {
  if (transactions.length === 0) return null;

  return (
    <div className="px-5 mt-8 mb-4">
      <h2 className="text-lg font-display font-bold mb-4">Recent Activity</h2>
      <div className="space-y-2">
        {transactions.slice(0, 5).map((tx, i) => {
          const Icon = categoryIcons[tx.category] || Star;
          const color = categoryColors[tx.category] || 'text-primary';
          const isPositive = tx.amount > 0;

          return (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border"
            >
              <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{tx.reason}</p>
                <p className="text-xs text-muted-foreground">{moment(tx.created_date).fromNow()}</p>
              </div>
              <span className={`text-sm font-bold ${isPositive ? 'text-accent' : 'text-destructive'}`}>
                {isPositive ? '+' : ''}{tx.amount}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}