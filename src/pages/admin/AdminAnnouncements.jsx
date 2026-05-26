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
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function AdminAnnouncements() {
  const { church } = useChurch();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', priority: 'normal', target_audience: 'all' });

  const { data: announcements = [] } = useQuery({
    queryKey: ['admin-announcements', church?.id],
    queryFn: () => base44.entities.Announcement.filter({ church_id: church?.id }, '-created_date', 50),
    enabled: !!church?.id,
  });

  const handleCreate = async () => {
    await base44.entities.Announcement.create({ ...form, church_id: church.id });
    queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    setForm({ title: '', body: '', priority: 'normal', target_audience: 'all' });
    setShowAdd(false);
    toast.success('Announcement posted!');
  };

  const handleDelete = async (id) => {
    await base44.entities.Announcement.delete(id);
    queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    toast.success('Deleted');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Announcements"
        showBack
        rightAction={
          <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> New
          </Button>
        }
      />

      <div className="px-5 mt-2 space-y-3">
        {announcements.map((a, i) => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{a.title}</p>
                    <Badge variant="outline" className="text-[10px] capitalize">{a.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{a.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{moment(a.created_date).fromNow()}</p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(a.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📢</p>
            <p className="font-semibold">No announcements</p>
          </div>
        )}
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">New Announcement</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="important">Important</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Audience</Label>
              <Select value={form.target_audience} onValueChange={(v) => setForm({ ...form, target_audience: v })}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  <SelectItem value="parents">Parents Only</SelectItem>
                  <SelectItem value="kids">Kids Only</SelectItem>
                  <SelectItem value="teachers">Teachers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} disabled={!form.title || !form.body} className="w-full rounded-xl">
              Post Announcement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}