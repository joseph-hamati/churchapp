import React from 'react';
import { Link } from 'react-router-dom';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Bell, Calendar, Users, Copy, LogOut, Church } from 'lucide-react';
import { toast } from 'sonner';

const menuItems = [
  { label: 'Review Submissions', path: '/admin/submissions', icon: CheckCircle, desc: 'Approve or reject task submissions' },
  { label: 'Mark Attendance', path: '/admin/attendance', icon: Calendar, desc: 'Record Sunday attendance' },
  { label: 'Announcements', path: '/admin/announcements', icon: Bell, desc: 'Send news to families' },
];

export default function AdminMore() {
  const { church, currentUser } = useChurch();

  const copyCode = () => {
    if (church?.join_code) {
      navigator.clipboard.writeText(church.join_code);
      toast.success('Copied!');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="More" subtitle="Church management" />

      <div className="px-5 mt-2">
        {/* Church Info */}
        <Card className="p-4 mb-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Church className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold">{church?.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Join Code:</span>
                <span className="text-sm font-bold font-mono tracking-widest">{church?.join_code}</span>
                <button onClick={copyCode}>
                  <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {/* Menu Items */}
        <div className="space-y-2 mb-6">
          {menuItems.map((item) => (
            <Link key={item.path} to={item.path}>
              <Card className="p-4 flex items-center gap-3 hover:shadow-md transition-all">
                <item.icon className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full rounded-2xl h-12 gap-2 text-destructive border-destructive/20"
          onClick={() => base44.auth.logout()}
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </Button>
      </div>
    </div>
  );
}