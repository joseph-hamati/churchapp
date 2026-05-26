import React from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, TrendingUp } from 'lucide-react';

export default function PointsCard({ student }) {
  const points = student?.points || 0;
  const level = student?.level || 1;
  const streak = student?.streak_days || 0;
  const nextLevel = level * 100;
  const progress = Math.min((student?.total_points_earned || 0) % nextLevel / nextLevel * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-5 rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-6 text-primary-foreground shadow-xl relative overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute top-[-20px] right-[-20px] w-32 h-32 bg-white/10 rounded-full" />
      <div className="absolute bottom-[-30px] left-[-10px] w-24 h-24 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold opacity-80">My Points</p>
            <p className="text-4xl font-display font-bold">{points.toLocaleString()}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <Star className="w-7 h-7" fill="currentColor" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 backdrop-blur-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Level {level}</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 bg-white/15 rounded-full px-3 py-1.5 backdrop-blur-sm">
              <Flame className="w-3.5 h-3.5" />
              <span className="text-xs font-bold">{streak} day streak</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <div className="flex justify-between text-xs opacity-70 mb-1">
            <span>Next Level</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-white/80 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}