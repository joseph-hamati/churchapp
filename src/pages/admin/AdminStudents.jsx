import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Star, Minus, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminStudents() {
  const { church } = useChurch();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', parent_email: '', date_of_birth: '' });
  const [pointsModal, setPointsModal] = useState(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [linkModal, setLinkModal] = useState(null);
  const [linkEmail, setLinkEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkError, setLinkError] = useState('');

  const { data: students = [] } = useQuery({
    queryKey: ['admin-students', church?.id],
    queryFn: () => base44.entities.Student.filter({ church_id: church?.id }, '-created_date', 200),
    enabled: !!church?.id,
  });

  const filtered = students.filter(s =>
    `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddStudent = async () => {
    await base44.entities.Student.create({
      ...form,
      church_id: church.id,
      points: 0,
      total_points_earned: 0,
      level: 1,
      streak_days: 0,
      status: 'active',
      badges: [],
    });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    setForm({ first_name: '', last_name: '', parent_email: '', date_of_birth: '' });
    setShowAdd(false);
    toast.success('Student added!');
  };

  const handleLinkUser = async () => {
    setLinking(true);
    setLinkError('');
    const users = await base44.entities.User.filter({ email: linkEmail.trim().toLowerCase() });
    if (users.length === 0) {
      setLinkError('No user found with that email. Make sure they have signed up first.');
      setLinking(false);
      return;
    }
    const user = users[0];
    await base44.entities.User.update(user.id, { student_id: linkModal.id, user_type: 'kid', church_id: church.id, onboarded: true });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    setLinkModal(null);
    setLinkEmail('');
    setLinking(false);
    toast.success(`${linkModal.first_name} linked to ${user.full_name || linkEmail}! 🎉`);
  };

  const handleGivePoints = async (isPositive) => {
    const amount = parseInt(pointsAmount) * (isPositive ? 1 : -1);
    const student = pointsModal;
    await base44.entities.PointTransaction.create({
      church_id: church.id,
      student_id: student.id,
      amount,
      reason: pointsReason || (isPositive ? 'Points awarded' : 'Points deducted'),
      category: 'manual',
    });
    await base44.entities.Student.update(student.id, {
      points: (student.points || 0) + amount,
      total_points_earned: isPositive ? (student.total_points_earned || 0) + amount : student.total_points_earned,
    });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    setPointsModal(null);
    setPointsAmount('');
    setPointsReason('');
    toast.success(isPositive ? 'Points awarded!' : 'Points deducted');
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Students"
        showBack
        rightAction={
          <Button size="sm" className="rounded-xl gap-1" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        }
      />

      <div className="px-5 mt-2">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-2xl"
          />
        </div>

        <div className="space-y-2">
          {filtered.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {s.first_name?.[0]}{s.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{s.first_name} {s.last_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="outline" className="text-[10px]">Lvl {s.level || 1}</Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Star className="w-3 h-3 text-secondary" fill="currentColor" /> {s.points || 0}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => { setLinkModal(s); setLinkError(''); setLinkEmail(''); }}>
                    🔗 Link
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs" onClick={() => setPointsModal(s)}>
                    ± Points
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Link User Dialog */}
      <Dialog open={!!linkModal} onOpenChange={(o) => { if (!o) { setLinkModal(null); setLinkEmail(''); setLinkError(''); } }}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Link Kid Account</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Enter the email address the kid (or parent) used to sign up. This will connect their login to <strong>{linkModal?.first_name}'s</strong> profile.</p>
          <div className="space-y-3">
            <div>
              <Label>Kid's Login Email</Label>
              <Input
                type="email"
                placeholder="e.g. kid@example.com"
                value={linkEmail}
                onChange={(e) => setLinkEmail(e.target.value)}
                className="rounded-xl"
              />
            </div>
            {linkError && <p className="text-destructive text-sm">{linkError}</p>}
            <Button onClick={handleLinkUser} disabled={!linkEmail || linking} className="w-full rounded-xl">
              {linking ? 'Linking...' : 'Link Account'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">Add Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>First Name</Label>
              <Input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Parent Email (optional)</Label>
              <Input value={form.parent_email} onChange={(e) => setForm({ ...form, parent_email: e.target.value })} className="rounded-xl" />
            </div>
            <div>
              <Label>Date of Birth (optional)</Label>
              <Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="rounded-xl" />
            </div>
            <Button onClick={handleAddStudent} disabled={!form.first_name || !form.last_name} className="w-full rounded-xl">
              Add Student
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={!!pointsModal} onOpenChange={() => setPointsModal(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display">
              Points for {pointsModal?.first_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Amount</Label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="e.g. 10"
                className="rounded-xl"
              />
            </div>
            <div>
              <Label>Reason</Label>
              <Input
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="e.g. Great behavior"
                className="rounded-xl"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleGivePoints(true)}
                disabled={!pointsAmount}
                className="flex-1 rounded-xl gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                <Plus className="w-4 h-4" /> Give
              </Button>
              <Button
                onClick={() => handleGivePoints(false)}
                disabled={!pointsAmount}
                variant="destructive"
                className="flex-1 rounded-xl gap-1"
              >
                <Minus className="w-4 h-4" /> Deduct
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}