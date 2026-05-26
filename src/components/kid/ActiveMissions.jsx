import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ChevronRight, Clock } from 'lucide-react';
import { format } from 'date-fns';

const typeEmojis = {
  bible_verse: '📖',
  prayer: '🙏',
  kindness: '💛',
  homework: '📝',
  video: '🎥',
  attendance: '✅',
  other: '⭐',
};

export default function ActiveMissions({ missions = [] }) {
  if (missions.length === 0) return null;

  return (
    <div className="px-5 mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-display font-bold">This Week's Missions</h2>
        <Link to="/missions" className="text-xs font-semibold text-primary">See All →</Link>
      </div>
      <div className="space-y-3">
        {missions.slice(0, 3).map((mission, i) => (
          <motion.div
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            <Link
              to="/missions"
              className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border hover:shadow-md transition-all"
            >
              <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-xl">
                {typeEmojis[mission.mission_type] || '⭐'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{mission.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center gap-1 text-secondary">
                    <Star className="w-3 h-3" fill="currentColor" />
                    <span className="text-xs font-bold">{mission.points_reward} pts</span>
                  </div>
                  {mission.due_date && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{format(new Date(mission.due_date), 'MMM d')}</span>
                    </div>
                  )}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
