import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Users, Star, Target, Gift, Bell, Copy, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { church, currentUser } = useChurch();

  const { data: students = [] } = useQuery({
    queryKey: ['admin-students', church?.id],
    queryFn: () => base44.entities.Student.filter({ church_id: church?.id }, '-created_date', 200),
    enabled: !!church?.id,
  });

  const { data: missions = [] } = useQuery({
    queryKey: ['admin-missions', church?.id],
    queryFn: () => base44.entities.Mission.filter({ church_id: church?.id, status: 'active' }),
    enabled: !!church?.id,
  });

  const { data: pendingSubmissions = [] } = useQuery({
    queryKey: ['pending-submissions', church?.id],
    queryFn: () => base44.entities.MissionSubmission.filter({ church_id: church?.id, status: 'pending' }),
    enabled: !!church?.id,
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['admin-rewards', church?.id],
    queryFn: () => base44.entities.Reward.filter({ church_id: church?.id, status: 'active' }),
    enabled: !!church?.id,
  });

  const totalPoints = students.reduce((sum, s) => sum + (s.total_points_earned || 0), 0);

  const stats = [
    { label: 'Students', value: students.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Active Missions', value: missions.length, icon: Target, color: 'text-accent', bg: 'bg-accent/10' },
    { label: 'Pending Reviews', value: pendingSubmissions.length, icon: CheckCircle, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Rewards', value: rewards.length, icon: Gift, color: 'text-chart-4', bg: 'bg-chart-4/10' },
  ];

  const quickActions = [
    { label: 'Manage Students', path: '/admin/students', icon: Users },
    { label: 'Create Mission', path: '/admin/missions', icon: Target },
    { label: 'Manage Rewards', path: '/admin/rewards', icon: Gift },
    { label: 'Review Submissions', path: '/admin/submissions', icon: CheckCircle },
    { label: 'Mark Attendance', path: '/admin/attendance', icon: Star },
    { label: 'Announcements', path: '/admin/announcements', icon: Bell },
  ];

  const copyJoinCode = () => {
    if (church?.join_code) {
      navigator.clipboard.writeText(church.join_code);
      toast.success('Join code copied!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title={church?.name || 'Dashboard'} subtitle="Church Admin" />

      {/* Join Code */}
      <div className="px-5 mt-2">
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground">Church Join Code</p>
              <p className="text-2xl font-display font-bold tracking-widest mt-1">{church?.join_code || '---'}</p>
            </div>
            <Button size="icon" variant="outline" className="rounded-xl" onClick={copyJoinCode}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="px-5 mt-4 grid grid-cols-2 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="px-5 mt-6">
        <h2 className="font-display font-bold text-lg mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
            >
              <Link to={action.path}>
                <Card className="p-4 hover:shadow-md transition-all hover:border-primary/20">
                  <action.icon className="w-5 h-5 text-primary mb-2" />
                  <p className="text-sm font-semibold">{action.label}</p>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}