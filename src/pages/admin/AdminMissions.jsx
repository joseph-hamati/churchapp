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
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Plus, Star, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const typeEmojis = {
  bible_verse: '📖', prayer: '🙏', kindness: '💛', homework: '📝',
  video: '🎥', attendance: '✅', other: '⭐',
};

export default function AdminMissions() {
  const { church } = useChurch();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', points_reward: '', mission_type: 'other',
    requires_upload: false, due_date: '',
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['admin-all-missions', church?.id],
    queryFn: () => base44.entities.Mission.filter({ church_id: church?.id }, '-created_date', 100),
    enabled: !!church?.id,
  });

  const handleCreate = async () => {
    await base44.entities.Mission.create({
      ...form,
      church_id: church.id,
      points_reward: parseInt(form.points_reward),
      status: 'active',
    });
    queryClient.invalidateQueries({ queryKey: ['admin-all-missions'] });
    setForm({ title: '', description: '', points_reward: '', mission_type: 'other', requires_upload: false, due_date: '' });
    setShowAdd(false);
    toast.success('Mission created!');
  };

  const handleDelete = async (id) => {
    await base44.entities.Mission.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-all-missions'] });
    toast.success('Mission deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Missions"
        showBack
        rightAction={
          <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> New
          </Button>
        }
      />

      <div className="px-5 mt-2 space-y-3">
        {missions.map((m, i) => (
          <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">{typeEmojis[m.mission_type] || '⭐'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{m.title}</p>
                    <Badge variant={m.status === 'active' ? 'default' : 'secondary'} className="text-[10px] capitalize">{m.status}</Badge>
                  </div>
                  {m.description && <p className="text-xs text-muted-foreground mt-1">{m.description}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-bold text-secondary flex items-center gap-1">
                      <Star className="w-3 h-3" fill="currentColor" /> {m.points_reward} pts
                    </span>
                    {m.due_date && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {format(new Date(m.due_date), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(m.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
        {missions.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-semibold">No missions created yet</p>
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm rounded-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Create Mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" placeholder="e.g. Memorize John 3:16" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Points Reward</Label>
              <Input type="number" value={form.points_reward} onChange={(e) => setForm({ ...form, points_reward: e.target.value })} className="rounded-xl" placeholder="e.g. 25" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.mission_type} onValueChange={(v) => setForm({ ...form, mission_type: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="bible_verse">📖 Bible Verse</SelectItem>
                  <SelectItem value="prayer">🙏 Prayer</SelectItem>
                  <SelectItem value="kindness">💛 Kindness</SelectItem>
                  <SelectItem value="homework">📝 Homework</SelectItem>
                  <SelectItem value="video">🎥 Video</SelectItem>
                  <SelectItem value="attendance">✅ Attendance</SelectItem>
                  <SelectItem value="other">⭐ Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date (optional)</Label>
              <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="rounded-xl" />
            </div>
            <div className="flex items-center justify-between">
              <Label>Requires Upload</Label>
              <Switch checked={form.requires_upload} onCheckedChange={(v) => setForm({ ...form, requires_upload: v })} />
            </div>
            <Button onClick={handleCreate} disabled={!form.title || !form.points_reward} className="w-full rounded-xl">
              Create Mission
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}