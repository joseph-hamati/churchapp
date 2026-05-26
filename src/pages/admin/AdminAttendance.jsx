import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useChurch } from '@/lib/churchContext';
import PageHeader from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Check, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminAttendance() {
  const { church, currentUser } = useChurch();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [marked, setMarked] = useState(new Set());

  const { data: students = [] } = useQuery({
    queryKey: ['admin-students', church?.id],
    queryFn: () => base44.entities.Student.filter({ church_id: church?.id, status: 'active' }, 'first_name'),
    enabled: !!church?.id,
  });

  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['attendance-date', church?.id, date],
    queryFn: () => base44.entities.Attendance.filter({ church_id: church?.id, date }),
    enabled: !!church?.id && !!date,
  });

  const alreadyMarked = new Set(existingAttendance.map(a => a.student_id));

  const toggleStudent = (studentId) => {
    const next = new Set(marked);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    setMarked(next);
  };

  const handleMarkAll = async () => {
    const pointsPerAttendance = 10;
    for (const studentId of marked) {
      if (alreadyMarked.has(studentId)) continue;
      const student = students.find(s => s.id === studentId);
      await base44.entities.Attendance.create({
        church_id: church.id,
        student_id: studentId,
        date,
        marked_by: currentUser?.email,
        points_awarded: pointsPerAttendance,
      });
      if (student) {
        await base44.entities.Student.update(studentId, {
          points: (student.points || 0) + pointsPerAttendance,
          total_points_earned: (student.total_points_earned || 0) + pointsPerAttendance,
          last_attendance_date: date,
        });
        await base44.entities.PointTransaction.create({
          church_id: church.id,
          student_id: studentId,
          amount: pointsPerAttendance,
          reason: `Sunday attendance - ${format(new Date(date), 'MMM d')}`,
          category: 'attendance',
        });
      }
    }
    queryClient.invalidateQueries({ queryKey: ['attendance-date'] });
    queryClient.invalidateQueries({ queryKey: ['admin-students'] });
    setMarked(new Set());
    toast.success(`Attendance marked for ${marked.size} students!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Attendance" showBack />

      <div className="px-5 mt-2">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl flex-1" />
        </div>

        <div className="space-y-2">
          {students.map((s, i) => {
            const isAlreadyMarked = alreadyMarked.has(s.id);
            const isSelected = marked.has(s.id);
            return (
              <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
                <Card
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all border-2 ${
                    isAlreadyMarked ? 'border-accent/30 bg-accent/5' :
                    isSelected ? 'border-primary/30 bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => !isAlreadyMarked && toggleStudent(s.id)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isAlreadyMarked || isSelected ? 'bg-accent text-accent-foreground' : 'bg-muted'
                  }`}>
                    {(isAlreadyMarked || isSelected) ? <Check className="w-4 h-4" /> : <span className="text-xs font-bold">{s.first_name?.[0]}</span>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{s.first_name} {s.last_name}</p>
                  </div>
                  {isAlreadyMarked && <span className="text-[10px] text-accent font-bold">Present ✓</span>}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {marked.size > 0 && (
          <div className="fixed bottom-24 left-0 right-0 px-5 max-w-lg mx-auto">
            <Button onClick={handleMarkAll} className="w-full h-12 rounded-2xl text-base font-bold shadow-xl">
              Mark {marked.size} Present (+10 pts each)
            </Button>
          </div>
        )}

        {students.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">👋</p>
            <p className="font-semibold">No students yet</p>
          </div>
        )}
      </div>
    </div>
  );
}