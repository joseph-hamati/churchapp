import React from 'react';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, Info } from 'lucide-react';
import moment from 'moment';

const priorityConfig = {
  urgent: { color: 'bg-destructive/10 text-destructive border-destructive/20', icon: AlertTriangle },
  important: { color: 'bg-secondary/10 text-secondary border-secondary/20', icon: Bell },
  normal: { color: 'bg-muted text-muted-foreground border-border', icon: Info },
};

export default function Announcements() {
  const { church } = useChurch();

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements', church?.id],
    queryFn: () => base44.entities.Announcement.filter({ church_id: church?.id }, '-created_date', 50),
    enabled: !!church?.id,
  });

  return (
    <PullToRefresh>
    <div className="min-h-screen bg-background">
      <PageHeader title="Announcements" showBack />

      <div className="px-5 space-y-3 mt-2">
        {announcements.map((ann, i) => {
          const config = priorityConfig[ann.priority] || priorityConfig.normal;
          const Icon = config.icon;
          return (
            <motion.div
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={`p-4 border-2 ${config.color}`}>
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-bold text-sm">{ann.title}</p>
                    <p className="text-xs mt-1 opacity-80">{ann.body}</p>
                    <p className="text-[10px] mt-2 opacity-60">{moment(ann.created_date).fromNow()}</p>
                  </div>
                </div>
                {ann.image_url && (
                  <img src={ann.image_url} className="w-full rounded-xl mt-3" alt="" />
                )}
              </Card>
            </motion.div>
          );
        })}
        {announcements.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">📢</p>
            <p className="font-semibold">No announcements</p>
          </div>
        )}
      </div>
    </div>
    </PullToRefresh>
  );
}