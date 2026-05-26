import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import PullToRefresh from '@/components/shared/PullToRefresh';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Clock, Upload, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const typeEmojis = {
  bible_verse: '📖', prayer: '🙏', kindness: '💛', homework: '📝',
  video: '🎥', attendance: '✅', other: '⭐',
};

export default function Missions() {
  const { church, student } = useChurch();
  const queryClient = useQueryClient();
  const [selectedMission, setSelectedMission] = useState(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [optimisticSubmitted, setOptimisticSubmitted] = useState(new Set());

  const { data: missions = [] } = useQuery({
    queryKey: ['missions', church?.id],
    queryFn: () => base44.entities.Mission.filter({ church_id: church?.id, status: 'active' }, '-created_date', 50),
    enabled: !!church?.id,
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions', student?.id],
    queryFn: () => base44.entities.MissionSubmission.filter({ student_id: student?.id }, '-created_date', 50),
    enabled: !!student?.id,
  });

  const submittedMissionIds = new Set([...submissions.map(s => s.mission_id), ...optimisticSubmitted]);

  const handleSubmit = async () => {
    if (!selectedMission || !student) return;
    const missionId = selectedMission.id;
    const missionPoints = selectedMission.points_reward;
    const currentNote = note;
    const currentFile = file;
    setSubmitting(true);
    // Optimistic: close modal & mark submitted immediately
    setOptimisticSubmitted(prev => new Set([...prev, missionId]));
    setSelectedMission(null);
    setNote('');
    setFile(null);
    let fileUrl = '';
    if (currentFile) {
      const result = await base44.integrations.Core.UploadFile({ file: currentFile });
      fileUrl = result.file_url;
    }
    await base44.entities.MissionSubmission.create({
      church_id: church.id,
      mission_id: missionId,
      student_id: student.id,
      file_url: fileUrl,
      note: currentNote,
      status: 'pending',
    });
    queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    setSubmitting(false);
    toast.success('Mission submitted! Waiting for approval ✨');
  };

  return (
    <PullToRefresh>
    <div className="min-h-screen bg-background">
      <PageHeader title="Missions" subtitle="Complete tasks to earn points!" />

      <div className="px-5 space-y-3 mt-2">
        {missions.map((mission, i) => {
          const isSubmitted = submittedMissionIds.has(mission.id);
          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card
                className={`p-4 border-2 transition-all ${isSubmitted ? 'border-accent/30 bg-accent/5' : 'border-border hover:border-primary/30 cursor-pointer'}`}
                onClick={() => !isSubmitted && setSelectedMission(mission)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-xl flex-shrink-0">
                    {typeEmojis[mission.mission_type] || '⭐'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm">{mission.title}</p>
                      {isSubmitted && <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />}
                    </div>
                    {mission.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{mission.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1 text-secondary">
                        <Star className="w-3 h-3" fill="currentColor" />
                        <span className="text-xs font-bold">{mission.points_reward} pts</span>
                      </div>
                      {mission.due_date && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span className="text-xs">{format(new Date(mission.due_date), 'MMM d')}</span>
                        </div>
                      )}
                      {mission.requires_upload && (
                        <Badge variant="outline" className="text-[10px] py-0">
                          <Upload className="w-2.5 h-2.5 mr-1" /> Upload
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
        {missions.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🎯</p>
            <p className="font-semibold">No missions yet</p>
            <p className="text-sm">Check back soon!</p>
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {selectedMission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/50 flex items-end justify-center"
            onClick={() => setSelectedMission(null)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-card rounded-t-3xl p-6 pb-10 safe-area-bottom"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-lg">{selectedMission.title}</h3>
                <button onClick={() => setSelectedMission(null)}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              {selectedMission.description && (
                <p className="text-sm text-muted-foreground mb-4">{selectedMission.description}</p>
              )}
              <Textarea
                placeholder="Add a note about what you did..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="rounded-2xl mb-3"
              />
              {selectedMission.requires_upload && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-2">Upload proof</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="text-sm"
                  />
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-12 rounded-2xl text-base font-bold"
              >
                {submitting ? 'Submitting...' : `Submit (+${selectedMission.points_reward} pts)`}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  );
}