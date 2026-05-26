import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Star, Lock, Gift, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

const categoryEmojis = {
  toy: '🧸', snack: '🍭', certificate: '📜', privilege: '👑', surprise: '🎁',
};

export default function Rewards() {
  const { church, student, refreshStudent } = useChurch();
  const queryClient = useQueryClient();
  const [redeeming, setRedeeming] = useState(null);
  const [optimisticPoints, setOptimisticPoints] = useState(null);

  const { data: rewards = [] } = useQuery({
    queryKey: ['rewards', church?.id],
    queryFn: () => base44.entities.Reward.filter({ church_id: church?.id, status: 'active' }, '-created_date', 50),
    enabled: !!church?.id,
  });

  const points = optimisticPoints ?? student?.points ?? 0;

  const handleRedeem = async (reward) => {
    if (points < reward.points_cost) {
      toast.error("Not enough points yet! Keep going! 💪");
      return;
    }
    // Optimistic update
    setOptimisticPoints(points - reward.points_cost);
    setRedeeming(reward.id);
    await base44.entities.RewardRedemption.create({
      church_id: church.id,
      student_id: student.id,
      reward_id: reward.id,
      points_spent: reward.points_cost,
    });
    await base44.entities.Student.update(student.id, {
      points: student.points - reward.points_cost,
    });
    await base44.entities.PointTransaction.create({
      church_id: church.id,
      student_id: student.id,
      amount: -reward.points_cost,
      reason: `Redeemed: ${reward.name}`,
      category: 'reward_redemption',
      reference_id: reward.id,
    });
    queryClient.invalidateQueries({ queryKey: ['rewards'] });
    await refreshStudent();
    setOptimisticPoints(null);
    setRedeeming(null);
    toast.success('Reward redeemed! 🎉');
  };

  return (
    <PullToRefresh>
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Rewards Shop"
        subtitle={`You have ${points} points to spend!`}
        rightAction={
          <div className="flex items-center gap-1.5 bg-secondary/10 text-secondary rounded-full px-3 py-1.5">
            <Star className="w-3.5 h-3.5" fill="currentColor" />
            <span className="text-xs font-bold">{points}</span>
          </div>
        }
      />

      <div className="px-5 mt-2 grid grid-cols-2 gap-3">
        {rewards.map((reward, i) => {
          const canAfford = points >= reward.points_cost;
          return (
            <motion.div
              key={reward.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`overflow-hidden border-2 ${canAfford ? 'border-secondary/30' : 'border-border'}`}>
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {reward.image_url ? (
                    <img src={reward.image_url} alt={reward.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl">{categoryEmojis[reward.category] || '🎁'}</span>
                  )}
                  {!canAfford && (
                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-[10px] font-bold">
                    {reward.points_cost} pts
                  </Badge>
                </div>
                <div className="p-3">
                  <p className="font-bold text-sm truncate">{reward.name}</p>
                  {reward.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{reward.description}</p>
                  )}
                  <Button
                    onClick={() => handleRedeem(reward)}
                    disabled={!canAfford || redeeming === reward.id}
                    size="sm"
                    className="w-full mt-2 rounded-xl text-xs font-bold h-8"
                    variant={canAfford ? 'default' : 'outline'}
                  >
                    {redeeming === reward.id ? '...' : canAfford ? '🎉 Redeem' : `Need ${reward.points_cost - points} more`}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🎁</p>
          <p className="font-semibold">No rewards yet</p>
          <p className="text-sm">Your church will add some soon!</p>
        </div>
      )}
    </div>
    </PullToRefresh>
  );
}