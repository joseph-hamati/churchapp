import React from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import { ChurchProvider, useChurch } from '@/lib/churchContext';
import AppLayout from '@/components/shared/AppLayout';

import Onboarding from '@/pages/Onboarding';
import Home from '@/pages/Home';
import Missions from '@/pages/Missions';
import Rewards from '@/pages/Rewards';
import Leaderboard from '@/pages/Leaderboard';
import Announcements from '@/pages/Announcements';
import Profile from '@/pages/Profile';
import ParentProgress from '@/pages/ParentProgress';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminMissions from '@/pages/admin/AdminMissions';
import AdminRewards from '@/pages/admin/AdminRewards';
import AdminSubmissions from '@/pages/admin/AdminSubmissions';
import AdminAttendance from '@/pages/admin/AdminAttendance';
import AdminAnnouncements from '@/pages/admin/AdminAnnouncements';
import AdminMore from '@/pages/admin/AdminMore';

const AppRoutes = () => {
  const { currentUser, loading } = useChurch();

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Show onboarding if user hasn't set up yet
  if (!currentUser?.onboarded || !currentUser?.church_id) {
    return <Onboarding />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/missions" element={<Missions />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/progress" element={<ParentProgress />} />
        <Route path="/admin/students" element={<AdminStudents />} />
        <Route path="/admin/missions" element={<AdminMissions />} />
        <Route path="/admin/rewards" element={<AdminRewards />} />
        <Route path="/admin/submissions" element={<AdminSubmissions />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/admin/more" element={<AdminMore />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  React.useEffect(() => {
    const applyTheme = (e) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(mq);
    mq.addEventListener('change', applyTheme);
    return () => mq.removeEventListener('change', applyTheme);
  }, []);

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <ChurchProvider>
      <AppRoutes />
    </ChurchProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App