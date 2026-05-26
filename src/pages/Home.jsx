import React from 'react';
import { useChurch } from '@/lib/churchContext';
import KidDashboard from './KidDashboard';
import ParentDashboard from './ParentDashboard';
import AdminDashboard from './admin/AdminDashboard';

export default function Home() {
  const { currentUser } = useChurch();
  const role = currentUser?.user_type;

  if (role === 'admin' || role === 'teacher') return <AdminDashboard />;
  if (role === 'parent') return <ParentDashboard />;
  return <KidDashboard />;
}