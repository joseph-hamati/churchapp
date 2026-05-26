import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Check, X, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import moment from 'moment';

export default function AdminSubmissions() {
  const { church, currentUser } = useChurch();
  const queryClient = useQueryClient();

  const { data: submissions = [] } = useQuery({
    queryKey: ['all-submissions', church?.id],
    queryFn: () => base44.entities.MissionSubmission.filter({ church_id: church?.id }, '-created_date', 100),
    enabled: !!church?.id,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['admin-students', church?.id],
    queryFn: () => base44.entities.Student.filter({ church_id: church?.id }),
    enabled: !!church?.id,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['admin-missions-all', church?.id],
    queryFn: () => base44.entities.Mission.filter({ church_id: church?.id }),
    enabled: !!church?.id,
  });

  const studentMap = Object.fromEntries(students.map(s => [s.id, s]));
  const missionMap = Object.fromEntries(missions.map(m => [m.id, m]));

  const handleApprove = async (sub) => {
    const mission = missionMap[sub.mission_id];
    const student = studentMap[sub.student_id];
    const points = mission?.points_reward || 10;

    await base44.entities.MissionSubmission.update(sub.id, {
      status: 'approved',
      reviewed_by: currentUser?.email,
      points_awarded: points,
    });

    if (student) {
      await base44.entities.Student.update(student.id, {
        points: (student.points || 0) + points,
        total_points_earned: (student.total_points_earned || 0) + points,
      });
      await base44.entities.PointTransaction.create({
        church_id: church.id,
        student_id: student.id,
        amount: points,
        reason: `Mission completed: ${mission?.title || 'Unknown'}`,
        category: 'mission',
        reference_id: sub.mission_id,
      });
    }

    queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    toast.success(`Approved! +${points} pts awarded`);
  };

  const handleReject = async (sub) => {
    await base44.entities.MissionSubmission.update(sub.id, {
      status: 'rejected',
      reviewed_by: currentUser?.email,
    });
    queryClient.invalidateQueries({ queryKey: ['all-submissions'] });
    toast.success('Submission rejected');
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const reviewed = submissions.filter(s => s.status !== 'pending');

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Submissions" showBack subtitle={`${pending.length} pending`} />

      <div className="px-5 mt-2">
        {pending.length > 0 && <h3 className="font-display font-bold text-sm mb-3 text-primary">Pending Review</h3>}
        <div className="space-y-3">
          {pending.map((sub, i) => {
            const student = studentMap[sub.student_id];
            const mission = missionMap[sub.mission_id];
            return (
              <motion.div key={sub.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border-2 border-secondary/20">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{student?.first_name || 'Unknown'} {student?.last_name || ''}</p>
                      <p className="text-xs text-muted-foreground">{mission?.title || 'Mission'}</p>
                    </div>
                    <Badge className="text-[10px] bg-secondary/10 text-secondary">Pending</Badge>
                  </div>
                  {sub.note && <p className="text-xs text-muted-foreground mb-2">"{sub.note}"</p>}
                  {sub.file_url && (
                    <a href={sub.file_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1 mb-3">
                      <ExternalLink className="w-3 h-3" /> View Upload
                    </a>
                  )}
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 rounded-xl gap-1 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => handleApprove(sub)}>
                      <Check className="w-3.5 h-3.5" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" className="flex-1 rounded-xl gap-1" onClick={() => handleReject(sub)}>
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {reviewed.length > 0 && (
          <>
            <h3 className="font-display font-bold text-sm mt-6 mb-3 text-muted-foreground">Reviewed</h3>
            <div className="space-y-2">
              {reviewed.slice(0, 20).map((sub) => {
                const student = studentMap[sub.student_id];
                return (
                  <Card key={sub.id} className="p-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{student?.first_name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{moment(sub.created_date).fromNow()}</p>
                    </div>
                    <Badge variant={sub.status === 'approved' ? 'default' : 'destructive'} className="capitalize text-[10px]">
                      {sub.status}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          </>
        )}

        {submissions.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold">No submissions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}