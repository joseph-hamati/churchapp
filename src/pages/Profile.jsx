import React from 'react';
import { base44 } from '@/api/base44Client';
import { useChurch } from '@/lib/churchContext';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Star, Flame, Trophy, Award, LogOut, Church, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const { currentUser, student, church } = useChurch();

  const { data: redemptions = [] } = useQuery({
    queryKey: ['my-redemptions', student?.id],
    queryFn: () => base44.entities.RewardRedemption.filter({ student_id: student?.id }, '-created_date', 20),
    enabled: !!student?.id,
  });

  const { data: attendances = [] } = useQuery({
    queryKey: ['my-attendance', student?.id],
    queryFn: () => base44.entities.Attendance.filter({ student_id: student?.id }, '-date', 50),
    enabled: !!student?.id,
  });

  const name = student?.first_name || currentUser?.full_name || 'User';
  const isKid = currentUser?.user_type === 'kid';

  const stats = [
    { label: 'Points', value: student?.points || 0, icon: Star, color: 'text-secondary' },
    { label: 'Level', value: student?.level || 1, icon: Trophy, color: 'text-primary' },
    { label: 'Streak', value: student?.streak_days || 0, icon: Flame, color: 'text-chart-1' },
    { label: 'Sundays', value: attendances.length, icon: Award, color: 'text-accent' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="My Profile" />

      <div className="px-5 mt-2">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-6"
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-display font-bold text-primary mb-3">
            {name[0]}
          </div>
          <h2 className="text-xl font-display font-bold">{name} {student?.last_name || ''}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Church className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{church?.name || 'No church'}</span>
          </div>
          <Badge className="mt-2 capitalize">{currentUser?.user_type || 'kid'}</Badge>
        </motion.div>

        {/* Stats Grid — only for kids with a student record */}
        {isKid && student && (
        <div className="grid grid-cols-4 gap-2 mb-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Card className="p-3 text-center">
                <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} fill="currentColor" />
                <p className="text-lg font-bold">{stat.value}</p>
                <p className="text-[10px] text-muted-foreground font-medium">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>
        )}

        {isKid && student?.badges && student.badges.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display font-bold mb-3">My Badges</h3>
            <div className="flex flex-wrap gap-2">
              {student.badges.map((badge, i) => (
                <Badge key={i} variant="outline" className="text-sm py-1 px-3">
                  🏅 {badge}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isKid && redemptions.length > 0 && (
          <div className="mb-6">
            <h3 className="font-display font-bold mb-3">Reward History</h3>
            <div className="space-y-2">
              {redemptions.map((r) => (
                <Card key={r.id} className="p-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Reward #{r.reward_id?.slice(-4)}</p>
                    <Badge variant="outline" className="text-[10px] mt-1 capitalize">{r.status}</Badge>
                  </div>
                  <span className="text-sm font-bold text-destructive">-{r.points_spent}</span>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Account Settings */}
        <div className="mb-4">
          <h3 className="font-display font-bold mb-3">Account Settings</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full rounded-2xl h-12 gap-2 text-destructive border-destructive/20"
              onClick={async () => {
                await base44.auth.updateMe({ onboarded: false, church_id: null, user_type: null, student_id: null });
                base44.auth.logout();
              }}
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full rounded-2xl h-12 gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm rounded-3xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently remove your account and all associated data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="rounded-xl bg-destructive hover:bg-destructive/90"
                    onClick={async () => {
                      await base44.auth.updateMe({ onboarded: false, church_id: null, user_type: null, student_id: null });
                      base44.auth.logout();
                    }}
                  >
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}