import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Star, Trophy, Flame, CheckCircle, Calendar, TrendingUp } from 'lucide-react';
import moment from 'moment';

export default function ParentDashboard() {
  const { currentUser, church } = useChurch();
  const linkedIds = currentUser?.linked_student_ids || [];
  const [selectedKid, setSelectedKid] = useState(null);

  const { data: children = [] } = useQuery({
    queryKey: ['my-children', linkedIds],
    queryFn: async () => {
      if (linkedIds.length === 0) return [];
      const all = await base44.entities.Student.filter({ church_id: church?.id, status: 'active' });
      return all.filter(s => linkedIds.includes(s.id));
    },
    enabled: linkedIds.length > 0 && !!church?.id,
  });

  const activeKid = selectedKid || children[0];

  const { data: transactions = [] } = useQuery({
    queryKey: ['kid-transactions', activeKid?.id],
    queryFn: () => base44.entities.PointTransaction.filter({ student_id: activeKid?.id }, '-created_date', 20),
    enabled: !!activeKid?.id,
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['kid-attendance', activeKid?.id],
    queryFn: () => base44.entities.Attendance.filter({ student_id: activeKid?.id }, '-date', 20),
    enabled: !!activeKid?.id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['kid-submissions', activeKid?.id],
    queryFn: () => base44.entities.MissionSubmission.filter({ student_id: activeKid?.id }, '-created_date', 20),
    enabled: !!activeKid?.id,
  });

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Parent View" subtitle={`Welcome, ${currentUser?.full_name || 'Parent'}`} />

      {children.length === 0 ? (
        <div className="text-center py-16 px-5 text-muted-foreground">
          <p className="text-4xl mb-3">👨‍👩‍👧</p>
          <p className="font-semibold">No children linked yet</p>
          <p className="text-sm mt-1">Ask your church leader to link your children to your account.</p>
        </div>
      ) : (
        <>
          {/* Kid Selector */}
          {children.length > 1 && (
            <div className="px-5 flex gap-2 mt-2 overflow-x-auto pb-2">
              {children.map((kid) => (
                <button
                  key={kid.id}
                  onClick={() => setSelectedKid(kid)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all ${
                    activeKid?.id === kid.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {kid.first_name}
                </button>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="px-5 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4">
                <div className="flex items-center gap-2 text-secondary mb-1">
                  <Star className="w-4 h-4" fill="currentColor" />
                  <span className="text-xs font-semibold">Points</span>
                </div>
                <p className="text-2xl font-bold">{activeKid?.points || 0}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-semibold">Level</span>
                </div>
                <p className="text-2xl font-bold">{activeKid?.level || 1}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-chart-1 mb-1">
                  <Flame className="w-4 h-4" />
                  <span className="text-xs font-semibold">Streak</span>
                </div>
                <p className="text-2xl font-bold">{activeKid?.streak_days || 0} days</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-semibold">Attendance</span>
                </div>
                <p className="text-2xl font-bold">{attendances.length}</p>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-5 mt-6">
            <Tabs defaultValue="activity">
              <TabsList className="w-full">
                <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
                <TabsTrigger value="attendance" className="flex-1">Attendance</TabsTrigger>
                <TabsTrigger value="tasks" className="flex-1">Tasks</TabsTrigger>
              </TabsList>
              <TabsContent value="activity" className="mt-3 space-y-2">
                {transactions.map((tx) => (
                  <Card key={tx.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{tx.reason}</p>
                      <p className="text-xs text-muted-foreground">{moment(tx.created_date).fromNow()}</p>
                    </div>
                    <span className={`font-bold ${tx.amount > 0 ? 'text-accent' : 'text-destructive'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount}
                    </span>
                  </Card>
                ))}
                {transactions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No activity yet</p>}
              </TabsContent>
              <TabsContent value="attendance" className="mt-3 space-y-2">
                {attendances.map((a) => (
                  <Card key={a.id} className="p-3 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-accent" />
                    <div>
                      <p className="text-sm font-semibold">{moment(a.date).format('MMM D, YYYY')}</p>
                      <p className="text-xs text-muted-foreground">+{a.points_awarded || 10} pts</p>
                    </div>
                  </Card>
                ))}
                {attendances.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No attendance records</p>}
              </TabsContent>
              <TabsContent value="tasks" className="mt-3 space-y-2">
                {submissions.map((s) => (
                  <Card key={s.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">Mission #{s.mission_id?.slice(-4)}</p>
                      <p className="text-xs text-muted-foreground">{moment(s.created_date).fromNow()}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px]">{s.status}</Badge>
                  </Card>
                ))}
                {submissions.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">No task submissions</p>}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}