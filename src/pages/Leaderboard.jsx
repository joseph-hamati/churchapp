import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const podiumColors = ['text-secondary', 'text-muted-foreground', 'text-chart-1'];
const podiumBg = ['bg-secondary/10', 'bg-muted', 'bg-chart-1/10'];

export default function Leaderboard() {
  const { church, student } = useChurch();

  const { data: students = [] } = useQuery({
    queryKey: ['leaderboard', church?.id],
    queryFn: () => base44.entities.Student.filter({ church_id: church?.id, status: 'active' }, '-total_points_earned', 50),
    enabled: !!church?.id,
  });

  const topThree = students.slice(0, 3);
  const rest = students.slice(3);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Leaderboard" subtitle="Top Sunday School Stars!" />

      {/* Podium */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-3 px-5 mt-4 mb-8">
          {[1, 0, 2].map((idx) => {
            const s = topThree[idx];
            if (!s) return <div key={idx} className="w-24" />;
            const isMe = s.id === student?.id;
            const heights = ['h-32', 'h-24', 'h-20'];
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="flex flex-col items-center"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold border-2 mb-2",
                  isMe ? "border-primary bg-primary/10" : "border-border bg-muted"
                )}>
                  {s.avatar_url ? (
                    <img src={s.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{s.first_name?.[0]}</span>
                  )}
                </div>
                <p className="text-xs font-bold truncate max-w-[80px]">{s.first_name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3 h-3 text-secondary" fill="currentColor" />
                  <span className="text-xs font-bold">{s.total_points_earned || 0}</span>
                </div>
                <div className={cn(
                  "w-20 rounded-t-2xl mt-2 flex items-start justify-center pt-3",
                  podiumBg[idx],
                  heights[idx]
                )}>
                  <span className={cn("text-2xl font-display font-bold", podiumColors[idx])}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Rest of list */}
      <div className="px-5 space-y-2">
        {rest.map((s, i) => {
          const isMe = s.id === student?.id;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.03 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border",
                isMe ? "bg-primary/5 border-primary/20" : "bg-card border-border"
              )}
            >
              <span className="w-8 text-center text-sm font-bold text-muted-foreground">
                {i + 4}
              </span>
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                {s.first_name?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{s.first_name} {s.last_name?.[0]}.</p>
                <p className="text-xs text-muted-foreground">Level {s.level || 1}</p>
              </div>
              <div className="flex items-center gap-1 text-secondary">
                <Star className="w-3.5 h-3.5" fill="currentColor" />
                <span className="text-sm font-bold">{s.total_points_earned || 0}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {students.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🏆</p>
          <p className="font-semibold">No students yet</p>
        </div>
      )}
    </div>
  );
}