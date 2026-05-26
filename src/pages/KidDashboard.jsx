import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import { motion } from 'framer-motion';
import PullToRefresh from '@/components/shared/PullToRefresh';
import PointsCard from '@/components/kid/PointsCard';
import QuickActions from '@/components/kid/QuickActions';
import ActiveMissions from '@/components/kid/ActiveMissions';
import RecentActivity from '@/components/kid/RecentActivity';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function KidDashboard() {
  const { currentUser, student, church } = useChurch();

  const { data: missions = [] } = useQuery({
    queryKey: ['missions', church?.id],
    queryFn: () => base44.entities.Mission.filter({ church_id: church?.id, status: 'active' }, '-created_date', 10),
    enabled: !!church?.id,
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions', student?.id],
    queryFn: () => base44.entities.PointTransaction.filter({ student_id: student?.id }, '-created_date', 10),
    enabled: !!student?.id,
  });

  const firstName = student?.first_name || currentUser?.full_name?.split(' ')[0] || 'Friend';

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Hey there! 👋</p>
            <h1 className="text-2xl font-display font-bold">{firstName}</h1>
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <p className="text-5xl mb-4">👤</p>
          <h2 className="text-xl font-display font-bold mb-2">You're not linked yet!</h2>
          <p className="text-muted-foreground text-sm">
            Ask your church leader to add you as a student and link your account so you can start earning points and completing missions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh>
      <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">Hey there! 👋</p>
          <h1 className="text-2xl font-display font-bold">{firstName}</h1>
        </div>
        <Link
          to="/announcements"
          className="w-10 h-10 bg-card border border-border rounded-2xl flex items-center justify-center hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </Link>
      </div>

      <PointsCard student={student} />
      <QuickActions />
      <ActiveMissions missions={missions} />
      <RecentActivity transactions={transactions} />
      </div>
    </PullToRefresh>
  );
}