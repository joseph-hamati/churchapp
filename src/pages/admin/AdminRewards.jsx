import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const categoryEmojis = { toy: '🧸', snack: '🍭', certificate: '📜', privilege: '👑', surprise: '🎁' };

export default function AdminRewards() {
  const { church } = useChurch();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', points_cost: '', category: 'surprise', quantity_available: '-1' });

  const { data: rewards = [] } = useQuery({
    queryKey: ['admin-all-rewards', church?.id],
    queryFn: () => base44.entities.Reward.filter({ church_id: church?.id }, '-created_date', 100),
    enabled: !!church?.id,
  });

  const handleCreate = async () => {
    await base44.entities.Reward.create({
      ...form,
      church_id: church.id,
      points_cost: parseInt(form.points_cost),
      quantity_available: parseInt(form.quantity_available),
      status: 'active',
    });
    queryClient.invalidateQueries({ queryKey: ['admin-all-rewards'] });
    setForm({ name: '', description: '', points_cost: '', category: 'surprise', quantity_available: '-1' });
    setShowAdd(false);
    toast.success('Reward created!');
  };

  const handleDelete = async (id) => {
    await base44.entities.Reward.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-all-rewards'] });
    toast.success('Reward deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Rewards"
        showBack
        rightAction={
          <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> New
          </Button>
        }
      />

      <div className="px-5 mt-2 space-y-3">
        {rewards.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4 flex items-center gap-3">
              <div className="text-2xl">{categoryEmojis[r.category] || '🎁'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{r.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">
                    <Star className="w-2.5 h-2.5 mr-0.5" fill="currentColor" /> {r.points_cost} pts
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize">{r.category}</Badge>
 