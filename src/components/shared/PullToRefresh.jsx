import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

export default function PullToRefresh({ children }) {
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const pullY = useMotionValue(0);
  const pullOpacity = useTransform(pullY, [0, 60], [0, 1]);
  const pullScale = useTransform(pullY, [0, 60], [0.5, 1]);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - touchStartY.current;
    if (delta > 0 && window.scrollY === 0) {
      pullY.set(Math.min(delta * 0.4, 70));
    }
  };

  const handleTouchEnd = async () => {
    if (pullY.get() >= 55) {
      setRefreshing(true);
      await queryClient.invalidateQueries();
      setRefreshing(false);
    }
    animate(pullY, 0, { duration: 0.3, ease: 'easeOut' });
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <motion.div
        style={{ opacity: pullOpacity, scale: pullScale }}
        className="flex justify-center pt-3 h-10 items-center"
      >
        <div className={`w-7 h-7 rounded-full border-2 border-primary border-t-transparent ${refreshing ? 'animate-spin' : ''}`} />
      </motion.div>
      {children}
    </div>
  );
}